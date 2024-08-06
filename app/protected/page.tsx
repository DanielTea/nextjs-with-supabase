import DeployButton from "@/components/DeployButton";
import AuthButton from "@/components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import FetchDataSteps from "@/components/tutorial/FetchDataSteps";
import Header from "@/components/Header";
import { redirect } from "next/navigation";

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

  return (
    <div className="flex-1 w-full flex flex-col gap-10 items-center">
      <div className="w-full">
        <div className="py-6 font-bold bg-purple-950 text-center">
          This is a protected page that you can only see as an authenticated
          user
        </div>
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
            <DeployButton />
            <AuthButton />
          </div>
        </nav>
      </div>

      <div className="flex-1 flex flex-col gap-10 max-w-4xl px-3 w-full">
        <Header />
        <main className="flex-1 flex flex-col gap-6 w-full overflow-auto">
          <h2 className="font-bold text-4xl mb-4">Claims Data</h2>
          <div className="overflow-x-auto mb-8">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  {claims && claims.length > 0 &&
                    Object.keys(claims[0]).map((key) => (
                      <th
                        key={key}
                        className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {key}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {claims && claims.map((claim) => (
                  <tr key={claim.id}>
                    {Object.values(claim).map((value, index) => (
                      <td
                        key={index}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <h2 className="font-bold text-4xl mb-4">User Profiles Data</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  {userProfiles && userProfiles.length > 0 &&
                    Object.keys(userProfiles[0]).map((key) => (
                      <th
                        key={key}
                        className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {key}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userProfiles && userProfiles.map((profile) => (
                  <tr key={profile.id}>
                    {Object.values(profile).map((value, index) => (
                      <td
                        key={index}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
