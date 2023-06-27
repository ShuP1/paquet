import manifest from "@/fresh.gen.ts";
import type { Handlers } from "@/types/Handler.ts";
import { SitemapContext } from "fresh_seo";
import { supabase } from "@/lib/supabase.ts";

const excludedRoutes = [
	"/gfm.css",
	"/app/error",
];

export const handler: Handlers = {
	async GET() {
		const sitemap = new SitemapContext("https://paquet.app", manifest);
		const docs = Deno.readDir("docs");

		const { data: apps } = await supabase.from("apps")
			.select("*");

		if (!apps) {
			return sitemap.render();
		}

		// Add app routes
		apps.forEach((app) => {
			sitemap.add(`/app/${app.id}`);
		});

		for await (const dirEntry of docs) {
			sitemap.add(`/docs/${dirEntry.name.slice(0, -3)}`);
		}

		excludedRoutes.forEach((route) => {
			sitemap.remove(route);
		});

		return sitemap.render();
	},
};
