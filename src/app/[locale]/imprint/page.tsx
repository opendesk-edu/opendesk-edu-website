import type { Metadata } from "next";
import {Link} from '@/i18n/navigation';

interface PageProps {
  params: Promise<{locale: string}>;
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  await params;
  return {
    title: "Imprint | openDesk Edu",
  };
}

export default async function ImprintPage({params}: PageProps) {
  await params;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <article className="prose">
        <h1>Imprint</h1>

        <h2>Information according to § 5 TMG</h2>
        <p>
          <strong>Provider:</strong>
          <br />
          Dr. GraphWiz AI &amp; XR Consulting and Development Services
          <br />
          Grundstraße 69
          <br />
          78628 Rottweil
          <br />
          Germany
        </p>

        <h2>Contact</h2>
        <p>
          E-Mail:{" "}
          <a href="mailto:info@opendesk-edu.org">info@opendesk-edu.org</a>
        </p>

        <h2>Content Responsibility</h2>
        <p>
          The content of this website has been created with the greatest care.
          However, we cannot guarantee the accuracy, completeness, or timeliness
          of the content. As a service provider, we are responsible for our own
          content on these pages in accordance with § 7 para. 1 TMG under the
          general laws. According to §§ 8 to 10 TMG, however, we are not
          obligated as a service provider to monitor transmitted or stored third-party
          information or to investigate circumstances that indicate illegal activity.
        </p>

        <h2>References and Links</h2>
        <p>
          Our offer contains links to external third-party websites, the content
          of which we have no influence over. Therefore, we cannot assume any
          liability for these external contents. The respective provider or
          operator of the pages is always responsible for the content of the
          linked pages.
        </p>

        <h2>Copyright</h2>
        <p>
          The content and works created by the site operators on these pages are
          subject to German copyright law. Duplication, processing, distribution,
          and any form of commercialization of such material beyond the scope of
          the copyright law shall require the prior written consent of its
          respective author or creator.
        </p>

        <h2>Warranty</h2>
        <p>
          This website and its content are provided &quot;as is&quot; without any
          warranty, either express or implied. We do not warrant that the
          information on this website is complete, accurate, or up-to-date.
        </p>

        <h2>Privacy Protection</h2>
        <p>
          Please refer to our{" "}
          <Link href="/privacy">Privacy Policy</Link> for information on how we handle
          your personal data.
        </p>

        <h2>Consumer Dispute Resolution</h2>
        <p>
          The European Commission provides a platform for online dispute resolution
          (ODR):{" "}
          <a
            href="https://ec.europa.eu/consumers/odr/"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://ec.europa.eu/consumers/odr/
          </a>
          . We are neither willing nor obliged to participate in dispute
          resolution proceedings before a consumer arbitration board.
        </p>
      </article>
    </div>
  );
}
