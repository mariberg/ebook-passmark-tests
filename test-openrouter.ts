import dotenv from "dotenv";
dotenv.config();

async function testModel(model: string) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: "Say hello" }],
      max_tokens: 10,
    }),
  });
  const data = await res.json();
  console.log(`${model}: ${res.status}`, data.error ? data.error.message : "OK");
}

(async () => {
  await testModel("google/gemini-2.0-flash");
  await testModel("google/gemini-2.0-flash-001");
  await testModel("google/gemini-2.0-flash-exp");
  await testModel("google/gemini-flash-1.5");
  await testModel("google/gemini-2.5-flash");
  await testModel("google/gemini-2.5-flash-preview");
})();
