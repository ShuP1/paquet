import { useEffect, useState } from "preact/hooks";
import { supabase } from "@/lib/supabase-client.ts";

export interface RequiredAppData {
	id: string;
	name: string;
	icon: string;
	author: string;
	url: string;
}

export const useUserLoved = (ssrApps?: RequiredAppData[]) => {
	const [loading, setLoading] = useState(true);
	const [apps, setAppsRaw] = useState<RequiredAppData[]>(ssrApps || []);

	useEffect(() => {
		(async () => {
			const { data: { user } } = await supabase.auth.getUser();

			if (!user) {
				setLoading(false);
				return;
			}

			const { data } = await supabase
				.from("users")
				.select("loved")
				.eq("id", user.id)
				.single();

			if (data) {
				const { data: apps } = await supabase
					.from("apps")
					.select("id, name, icon, author, url")
					.in("id", data.loved);

				if (apps) {
					setAppsRaw(apps);
				}
			}

			setLoading(false);
		})();
	}, []);

	const setApps = async (apps: RequiredAppData[]) => {
		const { data: { user } } = await supabase.auth.getUser();

		if (!user) {
			return;
		}

		const { error } = await supabase
			.from("users")
			.update({ loved: apps.map((app) => app.id) })
			.eq("id", user.id);

		if (!error) {
			setAppsRaw(apps);
		}
	};

	return {
		apps,
		setApps,
		loading,
	};
};
