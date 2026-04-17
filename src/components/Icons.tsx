import Image from "next/image";

type IconProps = {
  className?: string;
  size?: number;
};

const SERVICES = ['bigbluebutton', 'bookstack', 'collabora', 'cryptpad', 'drawio', 'element', 'etherpad', 'excalidraw', 'grommunio', 'ilias', 'jitsi', 'limesurvey', 'moodle', 'nextcloud', 'notes', 'nubus', 'opencloud', 'openproject', 'ox-app-suite', 'planka', 'sogo', 'ssp', 'typo3', 'xwiki', 'zammad'] as const;

export function ServiceIcon({ service, size = 48, className }: { service: string; size?: number; className?: string }) {
  return (
    <Image
      src={`/static/icons/${service}-icon.svg`}
      alt={`${service} icon`}
      width={size}
      height={size}
      className={className}
      unoptimized
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = '/static/icons/edu-services-icon-set.svg';
      }}
    />
  );
}

export function EduServicesIconSet({ className }: { className?: string }) {
  return (
    <div className={`grid grid-cols-4 gap-4 ${className ?? ''}`}>
      {SERVICES.map(service => (
        <ServiceIcon key={service} service={service} size={48} />
      ))}
    </div>
  );
}

// Named exports for each service
export const BigBlueButtonIcon = (props: IconProps) => <ServiceIcon service="bigbluebutton" {...props} />;
export const BookStackIcon = (props: IconProps) => <ServiceIcon service="bookstack" {...props} />;
export const CollaboraIcon = (props: IconProps) => <ServiceIcon service="collabora" {...props} />;
export const CryptpadIcon = (props: IconProps) => <ServiceIcon service="cryptpad" {...props} />;
export const DrawioIcon = (props: IconProps) => <ServiceIcon service="drawio" {...props} />;
export const ElementIcon = (props: IconProps) => <ServiceIcon service="element" {...props} />;
export const EtherpadIcon = (props: IconProps) => <ServiceIcon service="etherpad" {...props} />;
export const ExcalidrawIcon = (props: IconProps) => <ServiceIcon service="excalidraw" {...props} />;
export const GrommunioIcon = (props: IconProps) => <ServiceIcon service="grommunio" {...props} />;
export const ILIASIcon = (props: IconProps) => <ServiceIcon service="ilias" {...props} />;
export const JitsiIcon = (props: IconProps) => <ServiceIcon service="jitsi" {...props} />;
export const LimeSurveyIcon = (props: IconProps) => <ServiceIcon service="limesurvey" {...props} />;
export const MoodleIcon = (props: IconProps) => <ServiceIcon service="moodle" {...props} />;
export const NextcloudIcon = (props: IconProps) => <ServiceIcon service="nextcloud" {...props} />;
export const NotesIcon = (props: IconProps) => <ServiceIcon service="notes" {...props} />;
export const NubusIcon = (props: IconProps) => <ServiceIcon service="nubus" {...props} />;
export const OpenCloudIcon = (props: IconProps) => <ServiceIcon service="opencloud" {...props} />;
export const OpenProjectIcon = (props: IconProps) => <ServiceIcon service="openproject" {...props} />;
export const OxAppSuiteIcon = (props: IconProps) => <ServiceIcon service="ox-app-suite" {...props} />;
export const PlankaIcon = (props: IconProps) => <ServiceIcon service="planka" {...props} />;
export const SOGoIcon = (props: IconProps) => <ServiceIcon service="sogo" {...props} />;
export const SSPIcon = (props: IconProps) => <ServiceIcon service="ssp" {...props} />;
export const TYPO3Icon = (props: IconProps) => <ServiceIcon service="typo3" {...props} />;
export const XWikiIcon = (props: IconProps) => <ServiceIcon service="xwiki" {...props} />;
export const ZammadIcon = (props: IconProps) => <ServiceIcon service="zammad" {...props} />;
