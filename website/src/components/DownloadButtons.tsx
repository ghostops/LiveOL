interface DownloadButtonsProps {
  size?: 'default' | 'small'
}

export default function DownloadButtons({
  size = 'default',
}: DownloadButtonsProps) {
  const dimensions = size === 'small' ? 'h-11 w-[135px]' : 'h-14 w-[152px]'

  return (
    <div className="flex flex-row gap-4 items-center">
      <a
        href="https://itunes.apple.com/app/liveol/id1450106846"
        target="_blank"
        rel="noopener noreferrer"
        className={`hover:opacity-80 transition-opacity inline-block ${dimensions}`}
      >
        <img
          src="/assets/images/appstore.png"
          alt="Download on the App Store"
          className="w-full h-full object-contain"
        />
      </a>
      <a
        href="https://play.google.com/store/apps/details?id=se.liveol.rn"
        target="_blank"
        rel="noopener noreferrer"
        className={`hover:opacity-80 transition-opacity inline-block ${dimensions}`}
      >
        <img
          src="/assets/images/playstore.png"
          alt="Get it on Google Play"
          className="w-full h-full object-contain block"
        />
      </a>
    </div>
  )
}
