import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
	SELF,
} from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";
import worker from "../src/index";

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe("Users page", () => {
	// Idempotent reset, so it works whether or not storage is isolated per test
	beforeEach(async () => {
		await env.p6.batch([
			env.p6.prepare("CREATE TABLE IF NOT EXISTS users (name TEXT)"),
			env.p6.prepare("DELETE FROM users"),
			env.p6.prepare("INSERT INTO users (name) VALUES (?)").bind("Emilio"),
		]);
	});

	it("renders users from D1 (unit style)", async () => {
		const request = new IncomingRequest("http://example.com");
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(200);
		expect(response.headers.get("Content-Type")).toContain("text/html");

		const html = await response.text();
		expect(html).toContain("<title>Users</title>");
		expect(html).toContain("<td>1</td>");
		expect(html).toContain("<td>Emilio</td>");
	});

	it("renders users from D1 (integration style)", async () => {
		const response = await SELF.fetch("https://example.com");
		const html = await response.text();

		expect(response.status).toBe(200);
		expect(html).toContain("<td>Emilio</td>");
	});
});