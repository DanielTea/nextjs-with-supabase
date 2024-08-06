"use client";

import { useState, useEffect } from "react";
import DeployButton from "@/components/DeployButton";
import AuthButton from "@/components/AuthButton";
import FetchDataSteps from "@/components/tutorial/FetchDataSteps";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProtectedPage() {
  const router = useRouter();
  const [claims, setClaims] = useState([]);
  const [userProfiles, setUserProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: claimsData, error: claimsError } = await supabase
        .from("claims")
        .select("*");
      const { data: userProfilesData, error: userProfilesError } = await supabase
        .from("user_profiles")
        .select("*");

      if (claimsError || userProfilesError) {
        console.error("Error fetching data:", claimsError || userProfilesError);
        return;
      }

      setClaims(claimsData);
      setUserProfiles(userProfilesData);
      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleInputChange = (e, table, index, key) => {
    const value = e.target.value;
    if (table === "claims") {
      const updatedClaims = [...claims];
      updatedClaims[index][key] = value;
      setClaims(updatedClaims);
    } else if (table === "user_profiles") {
      const updatedUserProfiles = [...userProfiles];
      updatedUserProfiles[index][key] = value;
      setUserProfiles(updatedUserProfiles);
    }
  };

  const saveChanges = async (table) => {
    if (table === "claims") {
      const { error } = await supabase.from("claims").upsert(claims);
      if (error) {
        console.error("Error saving claims:", error);
      }
    } else if (table === "user_profiles") {
      const { error } = await supabase.from("user_profiles").upsert(userProfiles);
      if (error) {
        console.error("Error saving user profiles:", error);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-10 items-center">
      <div className="w-full">
        <div className="py-6 font-bold bg-purple-950 text-center">
          This is a protected page that you can only see as an authenticated user
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
          <EditableTable data={claims} table="claims" handleInputChange={handleInputChange} />
          <button onClick={() => saveChanges("claims")} className="mt-4 p-2 bg-blue-500 text-white">Save Claims</button>

          <h2 className="font-bold text-4xl mb-4">User Profiles Data</h2>
          <EditableTable data={userProfiles} table="user_profiles" handleInputChange={handleInputChange} />
          <button onClick={() => saveChanges("user_profiles")} className="mt-4 p-2 bg-blue-500 text-white">Save User Profiles</button>
        </main>
      </div>
    </div>
  );
}

function EditableTable({ data, table, handleInputChange }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            {data && data.length > 0 && Object.keys(data[0]).map((key) => (
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
          {data && data.map((row, rowIndex) => (
            <tr key={row.id}>
              {Object.keys(row).map((key) => (
                <td
                  key={key}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                >
                  <input
                    type="text"
                    value={row[key]}
                    onChange={(e) => handleInputChange(e, table, rowIndex, key)}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
