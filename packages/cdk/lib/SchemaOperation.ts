import {Construct} from "constructs";
import {GraphqlApi} from "aws-cdk-lib/aws-appsync";
import {CodeFirstSchema, Directive, GraphqlType, ObjectType, ResolvableField} from "awscdk-appsync-utils";
import {IField} from "awscdk-appsync-utils/lib/schema-base";
import {Annotations} from "aws-cdk-lib";
import * as lambda from 'aws-cdk-lib/aws-lambda'

export class SchemaOperation extends Construct {

    constructor(scope: Construct, id: string, private props: {
        // GraphQL API to which to attach this operation and datasource (Lambda)
        api: GraphqlApi,

        // The schema which will be enriched with this operation and datatype
        schema: CodeFirstSchema,

        // The type of the operation, either 'query' or 'mutation'. Default: query
        operation?: 'query' | 'mutation',

        // If the response object is a single object or a list of objects
        isList?: boolean,

        // The field name, under which this operation will be available
        fieldName: string,

        // The response object definition for this operation
        fieldDefinition: {
            [key: string]: IField;
        },

        args?: {
            [key: string]: GraphqlType;
        },

        // The Lambda that will back this operation and compute the response
        lambda: lambda.Function,
    }) {
        super(scope, id);

        const operation = props.operation ?? 'query';
        const isList = !!props.isList;

        const DirectiveCognito = Directive.custom('@aws_cognito_user_pools')

        if (!props.fieldName.match(/^[a-zA-Z]+$/)) {
            Annotations.of(this).addError(`fieldName prop must be alphanumeric only, got: ${props.fieldName}`);
        }

        const DataType = props.schema.addType(new ObjectType(`${props.fieldName}ObjectType`, {
            definition: props.fieldDefinition,
            directives: [DirectiveCognito],
        }));

        const dataSource = props.api.addLambdaDataSource(`datasource-${props.fieldName}`, props.lambda)
        const returnType = DataType.attribute({isList})
        const directives = [DirectiveCognito];

        if (operation === 'mutation') {
            props.schema.addMutation(props.fieldName, new ResolvableField({
                returnType,
                dataSource,
                directives,
                args: props.args,
            }))
        } else {
            props.schema.addQuery(props.fieldName, new ResolvableField({
                returnType,
                dataSource,
                directives,
                args: props.args,
            }))
        }
    }
}
