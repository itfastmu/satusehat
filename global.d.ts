declare module "bun" {
    interface Env {
      HOST: string;
      USER_DB: string;
      PASSWORD: string;
      DATABASE: string;
      CLIENT_ID: string;
      CLIENT_SECRET: string;
    }
   }