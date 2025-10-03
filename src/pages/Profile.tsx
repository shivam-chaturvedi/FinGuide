import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { User, Settings, Globe, LogOut, Edit, Save, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";


export default function Profile() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    country: profile?.country || "",
    occupation: profile?.occupation || "",
    monthly_income: profile?.monthly_income?.toString() || "",
    financial_goals: profile?.financial_goals?.join(", ") || "",
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await updateProfile({
        full_name: editData.full_name,
        phone: editData.phone,
        country: editData.country,
        occupation: editData.occupation,
        monthly_income: editData.monthly_income ? parseInt(editData.monthly_income) : undefined,
        financial_goals: editData.financial_goals ? editData.financial_goals.split(", ") : [],
      });

      if (!error) {
        setIsEditing(false);
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
      country: profile?.country || "",
      occupation: profile?.occupation || "",
      monthly_income: profile?.monthly_income?.toString() || "",
      financial_goals: profile?.financial_goals?.join(", ") || "",
    });
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    if(confirm("Are you sure you want to sign out?")==false) {
      return;
    }
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center py-4">
        <div className="w-20 h-20 rounded-full bg-gradient-hero mx-auto mb-4 flex items-center justify-center">
          <User className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          {profile?.full_name || user?.email || "User"}
        </h1>
        <p className="text-muted-foreground">
          {profile?.created_at ? `Learning since ${new Date(profile.created_at).toLocaleDateString()}` : "Welcome!"}
        </p>
        <Badge className="mt-2 bg-primary/10 text-primary">
          <Globe className="h-3 w-3 mr-1" />
          English
        </Badge>
      </div>


      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Profile Information
              </CardTitle>
              <CardDescription>Manage your personal details</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={editData.full_name}
                    onChange={(e) => setEditData(prev => ({ ...prev, full_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={editData.phone}
                    onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={editData.country}
                    onChange={(e) => setEditData(prev => ({ ...prev, country: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={editData.occupation}
                    onChange={(e) => setEditData(prev => ({ ...prev, occupation: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly_income">Monthly Income (SGD)</Label>
                <Input
                  id="monthly_income"
                  type="number"
                  value={editData.monthly_income}
                  onChange={(e) => setEditData(prev => ({ ...prev, monthly_income: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="financial_goals">Financial Goals (comma-separated)</Label>
                <Textarea
                  id="financial_goals"
                  value={editData.financial_goals}
                  onChange={(e) => setEditData(prev => ({ ...prev, financial_goals: e.target.value }))}
                  placeholder="e.g., Save for emergency fund, Buy a house, Start a business"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} size="sm" disabled={isSaving}>
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                  <p className="text-sm">{profile?.full_name || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                  <p className="text-sm">{profile?.phone || "Not set"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Country</Label>
                  <p className="text-sm">{profile?.country || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Occupation</Label>
                  <p className="text-sm">{profile?.occupation || "Not set"}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Monthly Income</Label>
                <p className="text-sm">{profile?.monthly_income ? `SGD ${profile.monthly_income}` : "Not set"}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Financial Goals</Label>
                <p className="text-sm">{profile?.financial_goals?.join(", ") || "Not set"}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Settings */}
      <div className="space-y-3">

        <Button
          variant="destructive"
          className="w-full justify-start gap-3"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}