"use client";

import { useEffect, useMemo, useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Key, Save, ShieldAlert, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [cookieJson, setCookieJson] = useState("");
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasCookies, setHasCookies] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("x_cookies, x_connected")
        .eq("id", user.id)
        .single();

      if (cancelled) return;

      setUserId(user.id);

      if (data?.x_cookies && Object.keys(data.x_cookies).length > 0) {
        setHasCookies(true);
        // We don't display the cookies for security reasons, just indicate they exist
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const handleSaveCookies = async () => {
    if (!userId) return;
    setError("");
    setSuccess("");
    
    let parsedCookies: unknown[];
    try {
      parsedCookies = JSON.parse(cookieJson);
      if (!Array.isArray(parsedCookies)) {
        throw new Error("Cookies must be a JSON array");
      }
    } catch {
      setError("Invalid JSON format. Please paste the exact JSON array exported from EditThisCookie.");
      return;
    }

    setSaving(true);

    const response = await fetch("/api/settings/x-cookies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cookies: parsedCookies }),
    });

    if (!response.ok) {
      setError("Failed to save cookies to database.");
    } else {
      setSuccess("Twitter cookies saved successfully! Your account is connected.");
      setHasCookies(true);
      setCookieJson(""); // Clear the input field for security
    }
    
    setSaving(false);
  };

  return (
    <>
      <Topbar title="Settings & Integrations" description="Manage your account connections" />
      <div className="p-6 max-w-3xl space-y-6">
        
        {/* Twitter Integration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Key className="h-4 w-4 text-accent-blue" />
                  X (Twitter) Connection
                </CardTitle>
                <CardDescription className="mt-1">
                  Connect your X account by providing session cookies.
                </CardDescription>
              </div>
              {hasCookies ? (
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Connected
                </Badge>
              ) : (
                <Badge variant="warning" className="gap-1">
                  <ShieldAlert className="h-3 w-3" /> Not Connected
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="rounded-md bg-accent-blue/10 p-4 border border-accent-blue/20">
              <h4 className="text-sm font-medium text-accent-blue mb-2">How to get your cookies:</h4>
              <ol className="list-decimal list-inside text-sm text-text-secondary space-y-1">
                <li>Log in to X (Twitter) in your browser.</li>
                <li>Install a cookie exporter extension like <strong>EditThisCookie</strong>.</li>
                <li>Click the extension icon while on twitter.com and click <strong>Export</strong> (this copies JSON to your clipboard).</li>
                <li>Paste the JSON below and click Save.</li>
              </ol>
            </div>

            <div className="space-y-2">
              <Textarea
                value={cookieJson}
                onChange={(e) => setCookieJson(e.target.value)}
                placeholder='[{"domain": ".twitter.com", "name": "auth_token", "value": "..."}]'
                className="font-mono text-xs min-h-[150px]"
              />
            </div>

            {error && <p className="text-sm text-accent-rose">{error}</p>}
            {success && <p className="text-sm text-accent-green">{success}</p>}

            <div className="flex justify-end">
              <Button 
                onClick={handleSaveCookies} 
                loading={saving} 
                disabled={!cookieJson.trim()}
                icon={<Save className="h-4 w-4" />}
              >
                Save Cookies
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </>
  );
}
