require('dotenv').config();
const amqp = require('amqplib');

const rabbitmqHost = process.env.RABBITMQ_HOST;

async function publishToQueue(queueName, data) {
  const connection = await amqp.connect(rabbitmqHost);
  const channel = await connection.createChannel();
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
  await channel.close();
  await connection.close();
}

async function consumeQueue(queueName, correlationId) {
  const connection = await amqp.connect(rabbitmqHost);
  const channel = await connection.createChannel();

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(
        new Error(
          'Timeout: Não foi possível consumir a mensagem dentro do tempo esperado.'
        )
      );
      channel.close();
      connection.close();
    }, 15000);

    channel.consume(queueName, (msg) => {
      if (msg !== null) {
        const content = JSON.parse(msg.content.toString());
        if (content.correlationId === correlationId) {
          clearTimeout(timeout);
          resolve(content);
          channel.ack(msg);

          channel.close();
          connection.close();
        }
      }
    });
  });
}

module.exports = {
  publishToQueue,
  consumeQueue,
};
