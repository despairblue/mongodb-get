import { Collection, Db, FilterQuery, MongoClient } from "mongodb";
import pProps = require("p-props");

const createCollection = async function(
  db: Db,
  collectionContent: object[],
  collectionName: string
) {
  if (collectionContent.length > 0) {
    return db.collection(collectionName).insertMany(collectionContent);
  }
};

export async function set(
  dump: { [key: string]: object[] },
  db: Db,
  { clear = false } = {}
) {
  if (!db) {
    throw new Error("Missing argument. Second argument must be a MongoClient.");
  }

  const collections: Array<{
    name: string;
  }> = (await db.listCollections().toArray()).filter(
    ({ name }) => !name.startsWith("system.indexes")
  );

  if (clear) {
    for (const { name } of collections) {
      // remove all documents
      await db.collection(name).remove({});
    }
  }

  for (const collectionName of Object.keys(dump)) {
    const content = dump[collectionName];
    await createCollection(db, content, collectionName);
  }
}

export type MultiResult<T> = { [key: string]: T };

export function get(
  multiQuery: { [key: string]: FilterQuery<any> },
  db: Db
): Promise<MultiResult<object[]>> {
  if (!db) {
    throw new Error("Missing argument. Second argument must be a MongoClient.");
  }

  const foo = Object.keys(multiQuery).reduce(
    (acc: MultiResult<Promise<object>>, collectionName) => {
      const query = multiQuery[collectionName];

      acc[collectionName] = db
        .collection(collectionName)
        .find(query)
        .toArray();

      return acc;
    },
    {}
  );

  return pProps(foo);
}
