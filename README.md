# Chat Da Vinci - Chat GPT Alexa Skil

Chat Da Vinci è una skill per usare Chat GPT attraverso Alexa!

# Come importare la skill

Iscrivti su [OpenAI](https://openai.com/api/) e in seguito recati su questa pagina [Chat](https://beta.openai.com/playground/p/default-chat?model=text-davinci-003). Interagisci con il bot e, attraverso gli strumenti di sviluppo del browser, salva il token che viene utilizzato per eseguire le richiesta all'indirizzo https://api.openai.com/v1/engines/text-davinci-003/completions. <br>

Per importare la skill reacti sulla pagina [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask) e crea una nuova Skill.<br>

Inserisci :

- Nome Skill: Chat Da Vinci
- Lingua: Italiano
- Tipo di esperienza: Altro

Nella pagina di selezione Template cliccare "Import skill" e inserire il link di questa repository github.

Una volta fatto ciò, inserisci il token di OpenAi ottenuto precedentemente all'interno della funzione "ChatAPI" nello script index.js presente nella cartella lambda.
