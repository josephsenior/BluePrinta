# ChatGPT subscription provider

Blueprinta can use the ChatGPT plan usage preview for eligible local open-source clients. Set the following in `.env`, then restart the app:

```env
METASOP_LLM_PROVIDER=chatgpt
METASOP_LLM_MODEL=gpt-6.1-terra
```

Open the Create page on `http://localhost:3000` and choose **Continue with ChatGPT**. Approve the requested plan usage in the browser. Blueprinta keeps credentials in the local user profile under `.blueprinta/chatgpt`; do not share or commit that directory. Account selection and sign-out are available on the Create page. OpenAI applies account and plan limits; model availability depends on your account. Plus usage is shared across apps using your ChatGPT plan.

This feature uses the [OpenAI ChatGPT plan usage preview](https://developers.openai.com/siwc/token-sharing-open-source). Prompts and attachments are sent to OpenAI when this provider is active. Voice transcription continues to use Gemini. Run the application locally, not on a public server.
