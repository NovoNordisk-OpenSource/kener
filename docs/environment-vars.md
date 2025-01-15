---
title: Environment Variables | Kener
description: Kener needs some environment variables to be set to run properly. Here are the list of environment variables that you need to set.
---

# Environment Variables

Kener needs some environment variables to be set to run properly. Here are the list of environment variables that you need to set.

All of these are optional but are required for specific features.

## KENER_SECRET_KEY [Required]

Please set a strong secret key for Kener to use for encrypting the data. This is required to run Kener.

```bash
export KENER_SECRET_KEY=a-strong-secret-key
```

## ORIGIN [Required]

Set this to the origin of your website(protocl + hostname + port if there). This is required for CORS.

```bash
export ORIGIN=http://localhost:3000
```

## PORT

Defaults to 3000 if not specified

```bash
export PORT=4242
```

## GH_TOKEN

A github token to read issues and create labels. This is required for **incident management**

```bash
export GH_TOKEN=your-github-token
```

## KENER_BASE_PATH

By default kener runs on `/` but you can change it to `/status` or any other path.

-   Important: The base path should _**NOT**_ have a trailing slash and should start with `/`
-   Important: This env variable should be present during both build and run time

```bash
export KENER_BASE_PATH=/status
```

## RESEND_API_KEY

Kener uses [resend.com](https://resend.com) to send emails. Please make sure to sign up in [resend.com](https://resend.com) and get the API key. You will need to set the API key in the environment variable `RESEND_API_KEY`.

```bash
export RESEND_API_KEY=re_sometoken
```

## RESEND_SENDER_EMAIL

Set the sender email for the emails that are sent by Kener. This is required for sending emails. If you have not added a domain in resend, you can se something like `Some Name <onboarding@resend.dev>`. We recommend adding a domain in resend and using that email domain.

```bash
export RESEND_SENDER_EMAIL=Some Name <email@domain.com>
```

<div class="  note danger ">
	Please note that the RESEND_API_KEY is required for sending emails. If you do not set this, Kener will not be able to send emails. RESEND_SENDER_EMAIL is a must if you forget your password.
</div>

## DATABASE_URL

Kener uses a database to store its data. By default, Kener uses sqlite. You can change the database by setting the `DATABASE_URL` environment variable. The connection string has to start with `sqlite`, `postgresql`, or `mysql`. Read more about [database configuration](/docs/database).

```bash
export DATABASE_URL=sqlite://./database/awesomeKener.db
```

## TZ

Set the timezone for the server. Set it to UTC.

```bash
export TZ=UTC
```

## Using .env

You can also use a `.env` file to set these variables. Create a `.env` file in the root of the project and add the variables like below

```bash
KENER_SECRET_KEY=please_change_me
PORT=4242
GH_TOKEN=your-github-token
RESEND_API_KEY=re_sometoken
KENER_BASE_PATH=/status
ORIGIN=http://localhost:3000
```

## Secrets

Kener supports secrets in monitors. Let us say you have a monitor that is API based and you want to keep the API key secret.

Example: `https://api.example.com/users` with a header `Authorization: Bearer $CLIENT_SECRET`

You should set the `CLIENT_SECRET` in the your environment variables.

```bash
export CLIENT_SECRET=your-api-key
```

Remember to set the `CLIENT_SECRET` in your `.env` file if you are using one.
