/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require("ask-sdk-core");
const fetch = require("node-fetch");

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  handle(handlerInput) {
    const speakOutput = "";

    handlerInput.attributesManager.setSessionAttributes({ storiaAIChat: "" });

    return handlerInput.responseBuilder
      .addDelegateDirective({
        name: "ChatIntent",
        confirmationStatus: "NONE",
        slots: {},
      })
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

//CAMBIA TOKEN IN QUESTA FUNZIONE
async function ChatAPI(storiaAIChat) {
  return await new Promise(async (resolve, reject) => {
    //eseguo richiesta
    let resp = await fetch(
      "https://api.openai.com/v1/engines/text-davinci-003/completions",
      {
        headers: {
          accept: "text/event-stream",
          "accept-language": "it,it-IT;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
          authorization: "Bearer " + TOKEN,
          "content-type": "application/json",
          "openai-organization": "org-z3iyEp0jJAJQedmi738Zq7n6",
          "sec-ch-ua":
            '"Not?A_Brand";v="8", "Chromium";v="108", "Microsoft Edge";v="108"',
          "sec-ch-ua-mobile": "?1",
          "sec-ch-ua-platform": '"Android"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
          Referer: "https://beta.openai.com/",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        body:
          '{"prompt":"' +
          storiaAIChat +
          '","max_tokens":100,"temperature":0.9,"top_p":1,"frequency_penalty":0,"presence_penalty":0.6,"best_of":1,"echo":false,"logprobs":0,"stop":[" Human:"," AI:"],"stream":true}',
        method: "POST",
      }
    );

    let body = resp.body;
    let responseString = "";

    //leggo tutti i chunk della risposta
    body.on("readable", () => {
      let chunk;
      while (null !== (chunk = body.read())) {
        if (!chunk.toString().includes("data: [DONE]")) {
          try {
            let json = JSON.parse(chunk.toString().substring("6").toString());
            let text = json["choices"][0]["text"];
            responseString += text;
          } catch (err) {
            console.log("ERRORE" + chunk.toString());
          }
        }
      }
    });

    //quando finisce
    body.on("finish", async () => {
      //formatto la rispsota per non avere problemi con JSON nella richiesta
      let responseStringStoria = responseString;
      responseStringStoria = JSON.stringify(responseStringStoria);
      responseStringStoria = responseStringStoria.substring(
        1,
        responseStringStoria.length - 1
      );
      storiaAIChat += responseStringStoria + "\\nHuman:";
      resolve({ risposta: responseString, storia: storiaAIChat });
    });
  });
}

const ChatIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "ChatIntent"
    );
  },
  async handle(handlerInput) {
    let domanda =
      handlerInput.requestEnvelope.request.intent.slots.richiesta.value;
    //formatto la domanda per non avere problemi con JSON nella richiesta
    domanda = JSON.stringify(domanda);
    domanda = domanda.substring(1, domanda.length - 1);
    handlerInput.attributesManager.setSessionAttributes({
      storiaAIChat:
        handlerInput.attributesManager.getSessionAttributes().storiaAIChat +
        domanda +
        "\\nAI:",
    });

    //faccio richiesta
    let res = await ChatAPI(
      handlerInput.attributesManager.getSessionAttributes().storiaAIChat
    );

    const speakOutput = res.risposta.trim();
    //salvo la storia della chat
    handlerInput.attributesManager.setSessionAttributes({
      storiaAIChat: res.storia.trim(),
    });

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt("Vuoi chiedere qualcosaltro?")
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput = "You can say hello to me! How can I help?";

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.CancelIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const speakOutput = "Goodbye!";

    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet
 * */
const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.FallbackIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput = "Sorry, I don't know about that. Please try again.";

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs
 * */
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      "SessionEndedRequest"
    );
  },
  handle(handlerInput) {
    console.log(
      `~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`
    );
    // Any cleanup logic goes here.
    return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
  },
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents
 * by defining them above, then also adding them to the request handler chain below
 * */
const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest"
    );
  },
  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    const speakOutput = `You just triggered ${intentName}`;

    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    );
  },
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below
 * */
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    const speakOutput =
      "Sorry, I had trouble doing what you asked. Please try again.";
    console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom
 * */
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    ChatIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler
  )
  .addErrorHandlers(ErrorHandler)
  .withCustomUserAgent("sample/hello-world/v1.2")
  .lambda();
