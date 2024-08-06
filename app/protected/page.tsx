import { createClient } from "@/utils/supabase/server";
import EditableTables from "@/components/EditableTables";

export default async function ProtectedPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { data: claims, error: claimsError } = await supabase.from("claims").select("*");
  const { data: userProfiles, error: userProfilesError } = await supabase.from("user_profiles").select("*");

  if (claimsError || userProfilesError) {
    console.error("Error fetching data:", claimsError || userProfilesError);
    return <div>Error fetching data</div>;
  }

  return <EditableTables initialClaims={claims} initialUserProfiles={userProfiles} />;
}
