import { PolicyLayout } from "@/components/PolicyLayout"
import TermsContent from "@/content/legal/terms.mdx"

export default function TermsPage() {
  return (
    <PolicyLayout title="Terms and Conditions" lastUpdated="August 24, 2025">
      <div className="prose prose-invert max-w-none">
        <TermsContent />
      </div>
    </PolicyLayout>
  )
}
