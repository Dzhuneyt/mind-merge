# Mind Merge

Knowledge repository for teams

### Overview

In the era of AI and information overload, teams are still in need of tools to share "private knowledge" (e.g. company
or project documentation) in an easy and efficient way. Mind Merge is a knowledge repository that allows teams to write
knowledge base (articles) to be read by other team members.

It is a single-page application built with React+Next.js frontend and AWS AppSync (GraphQL) backend. The database engine
is AWS DynamoDB, with AWS Amplify handling the authentication (using an AWS Cognito user pool under the hood).

### Demo

https://mind-merge-app.vercel.app

Just sign up and start writing articles! Note that because this demo is publicly available, anybody can read them.

### Getting started

1. Install dependencies: `npx lerna bootstrap`
2. Deploy the backend infrastructure using <a href="https://aws.amazon.com/cdk/">AWS
   CDK</a>: `cd packages/cdk && npx cdk deploy`
3. Take the output of the CDK deployment and add it to the `.env` file in the `packages/frontend` directory.
4. Build the frontend: `cd packages/frontend && npm run dev`
