function sleep(n = 4000) {
  return new Promise((resolve) => {
    setTimeout(resolve, n);
  });
}

async function main() {
  await sleep();
  console.log("Hello world!");
}

main();

