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
const mongodb_1 = require("mongodb");
const src_1 = require("../src");
describe("mongodb-get", function () {
    let db;
    let client;
    beforeAll(function () {
        return __awaiter(this, void 0, void 0, function* () {
            client = yield mongodb_1.MongoClient.connect("mongodb://localhost");
            db = yield client.db("test");
        });
    });
    beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            const collections = (yield db.listCollections().toArray()).filter(({ name }) => !name.startsWith("system.indexes"));
            for (const { name } of collections) {
                yield db.collection(name).remove({});
            }
        });
    });
    afterAll(function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield client.close();
        });
    });
    describe("get", function () {
        test("returns results according to collection queries", function () {
            return __awaiter(this, void 0, void 0, function* () {
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
                yield src_1.set(fixture, db);
                const result1 = yield src_1.get({}, db);
                const result2 = yield src_1.get({ products: {} }, db);
                const result3 = yield src_1.get({ products: { name: "tablet" }, costumers: { interests: "book" } }, db);
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
    });
    describe("set", function () {
        test("does not clear collections by default", function () {
            return __awaiter(this, void 0, void 0, function* () {
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
                yield src_1.set(fixture1, db);
                yield src_1.set(fixture2, db);
                const result = yield src_1.get({ products: {}, costumers: {} }, db);
                expect(result).toEqual({
                    products: [...fixture1.products, ...fixture2.products],
                    costumers: [...fixture1.costumers, ...fixture2.costumers]
                });
            });
        });
        test("clears collections ", function () {
            return __awaiter(this, void 0, void 0, function* () {
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
                yield src_1.set(fixture1, db);
                yield src_1.set(fixture2, db, { clear: true });
                const result = yield src_1.get({ products: {}, costumers: {} }, db);
                expect(result).toEqual(fixture2);
            });
        });
    });
});
