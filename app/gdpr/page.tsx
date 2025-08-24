import { PolicyLayout } from "@/components/PolicyLayout"
import GDPRContent from "@/content/legal/gdpr.mdx"

export default function GDPRPage() {
  return (
    <PolicyLayout title="GDPR Compliance" lastUpdated="August 24, 2025">
      <div className="prose prose-invert max-w-none">
        <GDPRContent />
      </div>
    </PolicyLayout>
  )
}
