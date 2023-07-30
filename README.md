### Getting started

1. Install dependencies: `npx lerna bootstrap`
2. Deploy the backend infrastructure using <a href="https://aws.amazon.com/cdk/">AWS
   CDK</a>: `cd packages/cdk && npx cdk deploy`
3. Take the output of the CDK deployment and add it to the `.env` file in the `packages/frontend` directory.
4. Build the frontend: `cd packages/frontend && npm run dev`
