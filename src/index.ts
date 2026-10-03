
async function queryDatabase(db: D1Database) {
	const { results } = await db
		.prepare("SELECT rowid, name FROM users")
		.all();

	return results;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const users = await queryDatabase(env.pd);

		const rows = users
			.map(
				(user) => `
					<tr>
						<td>${user.rowid}</td>
						<td>${user.name}</td>
					</tr>
				`,
			)
			.join("");

		const html = `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Users</title>
				<style>
					body {
						font-family: Arial, sans-serif;
						max-width: 900px;
						margin: 40px auto;
						padding: 0 20px;
						background: #f5f5f5;
					}

					h1 {
						text-align: center;
					}

					table {
						width: 100%;
						border-collapse: collapse;
						background: white;
						box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
					}

					th, td {
						padding: 12px 16px;
						border-bottom: 1px solid #ddd;
						text-align: left;
					}

					th {
						background: #333;
						color: white;
					}

					tr:hover {
						background: #f1f1f1;
					}
				</style>
			</head>

			<body>
				<h1>Users</h1>

				<table>
					<thead>
						<tr>
							<th>ID</th>
							<th>Nombre</th>
						</tr>
					</thead>

					<tbody>
						${rows}
					</tbody>
				</table>
			</body>
			</html>
		`;

		return new Response(html, {
			headers: {
				"Content-Type": "text/html; charset=UTF-8",
			},
		});
	},
} satisfies ExportedHandler<Env>;

