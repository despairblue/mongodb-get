"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const pProps = require("p-props");
const createCollection = function (db, collectionContent, collectionName) {
    return __awaiter(this, void 0, void 0, function* () {
        if (collectionContent.length > 0) {
            return db.collection(collectionName).insertMany(collectionContent);
        }
    });
};
function set(dump, db, { clear = false } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!db) {
            throw new Error("Missing argument. Second argument must be a MongoClient.");
        }
        const collections = (yield db.listCollections().toArray()).filter(({ name }) => !name.startsWith("system.indexes"));
        if (clear) {
            for (const { name } of collections) {
                // remove all documents
                yield db.collection(name).remove({});
            }
        }
        for (const collectionName of Object.keys(dump)) {
            const content = dump[collectionName];
            yield createCollection(db, content, collectionName);
        }
    });
}
exports.set = set;
function get(multiQuery, db) {
    if (!db) {
        throw new Error("Missing argument. Second argument must be a MongoClient.");
    }
    const foo = Object.keys(multiQuery).reduce((acc, collectionName) => {
        const query = multiQuery[collectionName];
        acc[collectionName] = db
            .collection(collectionName)
            .find(query)
            .toArray();
        return acc;
    }, {});
    return pProps(foo);
}
exports.get = get;
