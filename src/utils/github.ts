const GITHUB_OAUTH_URL = "https://github.com/login/oauth/access_token";

export class GitHubAPI {
	async getAccessToken(code: string): Promise<string> {
		const res = await fetch(GITHUB_OAUTH_URL, {
			method: "POST",
			body: JSON.stringify({
				client_id: Deno.env.get("GITHUB_CLIENT_ID")!,
				client_secret: Deno.env.get("GITHUB_CLIENT_SECRET")!,
				code,
			}),
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
		});

		if (!res.ok) {
			throw new Error(await res.text());
		}

		const data = await res.json();
		const accessToken: string = data["access_token"];

		console.log(data);

		if (typeof accessToken !== "string") {
			throw new Error("Invalid access token");
		}

		return accessToken;
	}

	async getUserData(accessToken: string) {
		const response = await fetch("https://api.github.com/user", {
			headers: {
				Authorization: `token ${accessToken}`,
			},
		});

		if (!response.ok) {
			throw new Error(await response.text());
		}

		const userData = await response.json();

		return {
			id: userData.id as number,
			email: userData.email as string,
			username: userData.login as string,
		};
	}
}

export const githubAPI = new GitHubAPI();
