import mongodb, { Db, MongoClient } from "mongodb";
import { get, set } from "../src";

describe("mongodb-get", function() {
  let db: Db;
  let client: MongoClient;

  beforeAll(async function() {
    client = await MongoClient.connect("mongodb://localhost");
    db = await client.db("test");
  });

  beforeEach(async function() {
    const collections: Array<{
      name: string;
    }> = (await db.listCollections().toArray()).filter(
      ({ name }) => !name.startsWith("system.indexes")
    );

    for (const { name } of collections) {
      await db.collection(name).remove({});
    }
  });

  afterAll(async function() {
    await client.close();
  });

  describe("get", function() {
    test("returns results according to collection queries", async function() {
      const fixture = {
        products: [
          { name: "phone", description: "a phone" },
          { name: "tablet", description: "a tablet" },
          { name: "party canon", description: "a party canon" },
          { name: "book", description: "a book" }
        ],
        costumers: [
          { name: "Pinkypie", interests: ["party canon"] },
          { name: "Twilight Sparkle", interests: ["book", "magic"] }
        ]
      };

      await set(fixture, db);

      const result1 = await get({}, db);
      const result2 = await get({ products: {} }, db);
      const result3 = await get(
        { products: { name: "tablet" }, costumers: { interests: "book" } },
        db
      );

      expect(result1).toEqual({});
      expect(result2).toEqual({
        products: fixture.products
      });
      expect(result3).toEqual({
        products: [fixture.products[1]],
        costumers: [fixture.costumers[1]]
      });
    });
  });

  describe("set", function() {
    test("does not clear collections by default", async function() {
      const fixture1 = {
        products: [
          { name: "phone", description: "a phone" },
          { name: "tablet", description: "a tablet" }
        ],
        costumers: [{ name: "Pinkypie", interests: ["party canon"] }]
      };
      const fixture2 = {
        products: [
          { name: "party canon", description: "a party canon" },
          { name: "book", description: "a book" }
        ],
        costumers: [{ name: "Twilight Sparkle", interests: ["book", "magic"] }]
      };

      await set(fixture1, db);
      await set(fixture2, db);

      const result = await get({ products: {}, costumers: {} }, db);

      expect(result).toEqual({
        products: [...fixture1.products, ...fixture2.products],
        costumers: [...fixture1.costumers, ...fixture2.costumers]
      });
    });

    test("clears collections ", async function() {
      const fixture1 = {
        products: [
          { name: "phone", description: "a phone" },
          { name: "tablet", description: "a tablet" }
        ],
        costumers: [{ name: "Pinkypie", interests: ["party canon"] }]
      };
      const fixture2 = {
        products: [
          { name: "party canon", description: "a party canon" },
          { name: "book", description: "a book" }
        ],
        costumers: [{ name: "Twilight Sparkle", interests: ["book", "magic"] }]
      };

      await set(fixture1, db);
      await set(fixture2, db, { clear: true });

      const result = await get({ products: {}, costumers: {} }, db);

      expect(result).toEqual(fixture2);
    });
  });
});
