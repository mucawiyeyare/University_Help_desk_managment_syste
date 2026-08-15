import { useEffect, useState } from 'react';
import { SOCKET_URL } from '../../api/axios';

export const resolveAvatarUrl = (avatar) => {
  if (!avatar) return '';
  if (/^(https?:|blob:|data:)/i.test(avatar)) return avatar;
  return `${SOCKET_URL}${avatar.startsWith('/') ? avatar : `/${avatar}`}`;
};

export default function UserAvatar({ avatar, name, className = '', style = {}, alt = 'Profile image' }) {
  const source = resolveAvatarUrl(avatar);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [source]);

  return (
    <div
      className={`rounded-full overflow-hidden flex items-center justify-center font-bold shrink-0 ${className}`}
      style={{
        background: 'linear-gradient(135deg, #2175B5, #0F7D4B)',
        color: '#FFFFFF',
        ...style,
      }}
    >
      {source && !imageFailed ? (
        <img
          src={source}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span aria-label={alt}>{name ? name.charAt(0).toUpperCase() : 'U'}</span>
      )}
    </div>
  );
}
