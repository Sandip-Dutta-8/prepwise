import "dotenv/config";
import { db } from "./lib/prisma";

async function main() {
    try {
        const result = await db.user.findMany({ take: 1 });
        console.log("SUCCESS:", result);
    } catch (error) {
        console.error("FULL ERROR:", error);
    } finally {
        process.exit(0);
    }
}

main();