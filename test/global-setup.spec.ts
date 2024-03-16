import dockerCompose from "docker-compose";

async function setup() {
  // eslint-disable-next-line no-console
  console.time("global-setup");
  await dockerCompose.upAll({
    cwd: __dirname,
  });
  await dockerCompose.exec(
    "database",
    ["sh", "-c", "until pg_isready ; do sleep 1; done"],
    {
      cwd: __dirname,
    }
  );
  // wait for database to be ready
  await new Promise((resolve) => setTimeout(resolve, 2000));
  await dockerCompose.exec(
    "database",
    ["sh", "-c", "createdb -U test test-db"],
    {
      cwd: __dirname,
    }
  );

  // eslint-disable-next-line no-console
  console.timeEnd("global-setup");
}

async function tearDown() {
  if (process.env.WITHOUT_DOCKER) return;
  // eslint-disable-next-line no-console
  console.log("global-teardown");
  await dockerCompose.down({ cwd: __dirname });
}

before(async function () {
  this.timeout(5000); // eslint-disable-line no-invalid-this
  await setup();
});

after(async () => {
  await tearDown();
});
