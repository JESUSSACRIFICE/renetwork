import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(20).optional(),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000),
});

interface ContactFormProps {
  profileId: string;
  professionalName: string;
}

const ContactForm = ({ profileId, professionalName }: ContactFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from("leads").insert({
        profile_id: profileId,
        user_id: user?.id || null,
        name: result.data.name,
        email: result.data.email,
        phone: result.data.phone || null,
        message: result.data.message,
      });

      if (error) throw error;

      toast.success("Message sent successfully!");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error: any) {
      toast.error("Failed to send message");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 sticky top-8">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-bold">Contact {professionalName.split(' ')[0]}</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Your name"
            required
            maxLength={100}
          />
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="your@email.com"
            required
            maxLength={255}
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(555) 123-4567"
            maxLength={20}
          />
        </div>

        <div>
          <Label htmlFor="message">Message *</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Tell us about your project..."
            rows={5}
            required
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formData.message.length}/1000 characters
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </Card>
  );
};

export default ContactForm;
