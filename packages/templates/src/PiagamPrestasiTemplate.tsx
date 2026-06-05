import React from 'react';

export interface PiagamPrestasiTemplateProps {
  organizationName: string;
  districtName: string;
  piagamNumber: string;
  recipientName: string;
  prestasi: string;
  eventName: string;
  eventDate: string;
  location: string;
  issuedPlaceDate: string;
  signers: {
    pastor: { name: string; title: string };
    koordinator: { name: string; title: string };
  };
  qrValue: string;
  qrDataUrl?: string;
}

const Logo: React.FC = () => (
  <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fde047', border: '6px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'white', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#1e40af' }}>THS</div>
  </div>
);

const QrMini: React.FC<{ value: string; dataUrl?: string }> = ({ value, dataUrl }) => {
  const qrImg = dataUrl
    ? React.createElement('img', { src: dataUrl, alt: 'QR', style: { width: '100%', height: '100%', objectFit: 'contain' } })
    : React.createElement('div', { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#64748b' } }, `QR: ${value}`);
  return React.createElement('div', { style: { width: 80, height: 80, background: 'white', borderRadius: 8, padding: 6, border: '2px solid #1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, qrImg);
};

const PiagamPrestasiTemplate: React.FC<PiagamPrestasiTemplateProps> = (props) => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: 32, background: '#f1f5f9' }}>
    <div style={{ position: 'relative', width: 1188, height: 840, background: 'linear-gradient(135deg, #fefce8 0%, #ffffff 50%, #fef9c3 100%)', borderRadius: 28, overflow: 'hidden', border: '1px solid #cbd5e1' }}>
      {/* Decorative */}
      <div style={{ position: 'absolute', top: -160, right: -144, width: 520, height: 520, borderRadius: '50%', background: 'rgba(250,204,21,0.15)' }} />
      <div style={{ position: 'absolute', bottom: -192, left: -160, width: 620, height: 620, borderRadius: '50%', background: 'rgba(234,179,8,0.1)' }} />
      <div style={{ position: 'absolute', inset: 34, borderRadius: 22, border: '4px solid #eab308' }} />
      <div style={{ position: 'absolute', inset: 48, borderRadius: 16, border: '1px solid rgba(113,63,18,0.2)' }} />
      {/* Watermark */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', opacity: 0.04 }}>
        <div style={{ width: 430, height: 430, borderRadius: '50%', border: '30px solid #713f12', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 90, fontWeight: 900, color: '#713f12' }}>THS</div>
      </div>

      <div style={{ position: 'relative', zIndex: 10, height: '100%' }}>
        {/* Top */}
        <div style={{ position: 'absolute', top: 60, left: 80, right: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo />
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: '0.05em', color: '#713f12' }}>{props.organizationName}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#92400e', marginTop: 4 }}>{props.districtName}</div>
          </div>
          <QrMini value={props.qrValue} dataUrl={props.qrDataUrl} />
        </div>

        {/* Title */}
        <div style={{ position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center' }}>
          <div style={{ fontSize: 56, fontWeight: 900, letterSpacing: '0.14em', color: '#713f12' }}>PIAGAM</div>
          <div style={{ marginTop: 4, fontSize: 30, fontWeight: 900, letterSpacing: '0.18em', color: '#ca8a04' }}>PRESTASI</div>
          <div style={{ marginTop: 16, fontSize: 17, color: '#475569' }}>Nomor: {props.piagamNumber}</div>
        </div>

        {/* Recipient */}
        <div style={{ position: 'absolute', top: 360, left: 96, right: 96, textAlign: 'center', color: '#334155' }}>
          <div style={{ fontSize: 22 }}>Diberikan kepada</div>
          <div style={{ marginTop: 16, display: 'inline-block', padding: '16px 64px', borderRadius: 16, background: 'rgba(255,255,255,0.9)', border: '2px solid #facc15' }}>
            <div style={{ fontSize: 44, fontWeight: 900, color: '#713f12', letterSpacing: '0.05em' }}>{props.recipientName}</div>
          </div>
          <div style={{ marginTop: 28, fontSize: 22, lineHeight: 1.625 }}>
            atas prestasi sebagai <span style={{ fontWeight: 900, color: '#92400e' }}>{props.prestasi}</span>
          </div>
          <div style={{ marginTop: 12, fontSize: 20, color: '#475569' }}>
            dalam kegiatan {props.eventName} · {props.eventDate} · {props.location}
          </div>
        </div>

        {/* Signers */}
        <div style={{ position: 'absolute', left: 96, right: 96, bottom: 80, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', textAlign: 'center', color: '#1e293b' }}>
          <div style={{ width: 280 }}>
            <div style={{ position: 'relative', height: 86 }}>
              <div style={{ position: 'absolute', left: 40, top: 4, fontSize: 52, fontFamily: 'cursive', transform: 'rotate(-8deg)', color: 'rgba(15,23,42,0.8)' }}>ttd</div>
              <div style={{ position: 'absolute', right: 32, top: 0, width: 80, height: 80, borderRadius: '50%', border: '4px solid rgba(250,204,21,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: 'rgba(234,179,8,0.8)', transform: 'rotate(-12deg)' }}>STEMPEL</div>
            </div>
            <div style={{ borderTop: '1px solid #92400e', paddingTop: 8 }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: '#713f12' }}>{props.signers.pastor.name}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>{props.signers.pastor.title}</div>
            </div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#475569', paddingBottom: 16 }}>{props.issuedPlaceDate}</div>
          <div style={{ width: 280 }}>
            <div style={{ position: 'relative', height: 86 }}>
              <div style={{ position: 'absolute', left: 40, top: 4, fontSize: 52, fontFamily: 'cursive', transform: 'rotate(-8deg)', color: 'rgba(15,23,42,0.8)' }}>ttd</div>
              <div style={{ position: 'absolute', right: 32, top: 0, width: 80, height: 80, borderRadius: '50%', border: '4px solid rgba(250,204,21,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: 'rgba(234,179,8,0.8)', transform: 'rotate(-12deg)' }}>STEMPEL</div>
            </div>
            <div style={{ borderTop: '1px solid #92400e', paddingTop: 8 }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: '#713f12' }}>{props.signers.koordinator.name}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>{props.signers.koordinator.title}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export { PiagamPrestasiTemplate };
