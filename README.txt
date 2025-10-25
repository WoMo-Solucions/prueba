# WSs Deployable v8
1) Sube todo este zip a GitHub Pages.
2) Abre `static/config.json` y pon tu URL base de n8n, por ejemplo:
   {"n8nWebhookUrl":"https://TU-N8N/webhook/womo-site","siteId":"womo-site"}
3) Ejecuta `supabase_schema.sql` en Supabase.
4) En n8n, crea 3 webhooks:
   - POST /webhook/womo-site/msg  -> devuelve {reply, suggest_quote?, suggest_handoff?}
   - POST /webhook/womo-site/quote -> guarda en leads + manda correo al cliente
   - POST /webhook/womo-site/handoff -> guarda en hand_offs + manda correo
