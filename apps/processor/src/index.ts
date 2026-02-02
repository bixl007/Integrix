import { PrismaClient } from "@integrix/database";
import { Kafka, Partitioners } from "kafkajs";

const TOPIC_NAME = "zap-events";

const client = new PrismaClient();

const kafka = new Kafka({
  clientId: "outbox-processor",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

async function main() {
  const admin = kafka.admin();
  console.log("Connecting to Kafka admin...");
  await admin.connect();
  console.log("Connected to Kafka admin.");
  const topics = await admin.listTopics();
  if (!topics.includes(TOPIC_NAME)) {
    console.log(`Topic ${TOPIC_NAME} does not exist, creating it...`);
    await admin.createTopics({
      validateOnly: false,
      topics: [
        {
          topic: TOPIC_NAME,
          numPartitions: 1,
          replicationFactor: 1,
        },
      ],
    });
    console.log(`Topic ${TOPIC_NAME} created.`);
  } else {
    console.log(`Topic ${TOPIC_NAME} already exists.`);
  }
  await admin.disconnect();
  console.log("Disconnected from Kafka admin.");

  const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });
  await producer.connect();

  while (1) {
    try {
      const pendingRows = await client.zapRunOutbox.findMany({
        where: {},
        take: 10,
      });
  
      if (pendingRows.length > 0) {
        await producer.send({
          topic: TOPIC_NAME,
          messages: pendingRows.map((r) => {
            return {
              value: JSON.stringify({zapRunId: r.zapRunId, stage: 0}),
            };
          }),
        });
  
        await client.zapRunOutbox.deleteMany({
          where: {
            id: {
              in: pendingRows.map((x) => x.id),
            },
          },
        });
        console.log("Processed messages:", pendingRows);
      }
    } catch (e) {
        console.error("Error processing outbox:", e);
        // Add a small delay before retrying to avoid spamming logs on persistent errors
        await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

main();
