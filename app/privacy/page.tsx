import { PolicyLayout } from "@/components/PolicyLayout"
import PrivacyContent from "@/content/legal/privacy.mdx"

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout title="Privacy Policy" lastUpdated="August 24, 2025">
      <div className="prose prose-invert max-w-none">
        <PrivacyContent />
      </div>
    </PolicyLayout>
  )
}
