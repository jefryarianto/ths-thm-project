import React from 'react';

export interface SertifikatPendadaranTemplateProps {
  organizationName: string;
  districtName: string;
  certificateNumber: string;
  recipientName: string;
  eventTitle: string;
  location: string;
  ranting: string;
  wilayah: string;
  distrik: string;
  issuedPlaceDate: string;
  finalScore: string;
  predicate: string;
  status: string;
  signers: {
    pastor: { name: string; title: string };
    koordinator: { name: string; title: string };
  };
  aspects: Array<{
    name: string;
    score: string;
    items: string[];
  }>;
  qrValue: string;
  qrDataUrl?: string;
}

const Logo: React.FC = () => (
  <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#fde047', border: '7px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'white', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: '#1e40af' }}>THS</div>
  </div>
);

const QrMini: React.FC<{ value: string; dataUrl?: string }> = ({ value, dataUrl }) => {
  const qrImg = dataUrl
    ? React.createElement('img', { src: dataUrl, alt: 'QR', style: { width: '100%', height: '100%', objectFit: 'contain' } })
    : React.createElement('div', { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#64748b' } }, `QR: ${value}`);
  return React.createElement('div', { style: { width: 96, height: 96, background: 'white', borderRadius: 8, padding: 8, border: '2px solid #1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, qrImg);
};

const InfoBox: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div style={{ borderRadius: 16, background: 'rgba(255,255,255,0.8)', border: '1px solid #bfdbfe', padding: '12px 20px' }}>
    <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 700 }}>{label}</div>
    <div style={{ fontSize: highlight ? 28 : 17, fontWeight: 900, color: '#1e3a5f', marginTop: 4 }}>{value}</div>
  </div>
);

const SignerBlock: React.FC<{ title: string; name: string }> = ({ title, name }) => (
  <div style={{ width: 280 }}>
    <div style={{ position: 'relative', height: 86 }}>
      <div style={{ position: 'absolute', left: 40, top: 4, fontSize: 52, fontFamily: 'cursive', transform: 'rotate(-8deg)', color: 'rgba(15,23,42,0.8)' }}>ttd</div>
      <div style={{ position: 'absolute', right: 32, top: 0, width: 80, height: 80, borderRadius: '50%', border: '4px solid rgba(96,165,250,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: 'rgba(37,99,235,0.8)', transform: 'rotate(-12deg)' }}>STEMPEL</div>
    </div>
    <div style={{ borderTop: '1px solid #64748b', paddingTop: 8 }}>
      <div style={{ fontSize: 17, fontWeight: 900, color: '#1e3a5f' }}>{name}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>{title}</div>
    </div>
  </div>
);

const CertificateFront: React.FC<SertifikatPendadaranTemplateProps> = (props) => (
  <div style={{ position: 'relative', width: 1188, height: 840, background: 'linear-gradient(135deg, #ecfeff 0%, #ffffff 50%, #dbeafe 100%)', borderRadius: 28, overflow: 'hidden', border: '1px solid #cbd5e1' }}>
    <div style={{ position: 'absolute', top: -160, right: -144, width: 520, height: 520, borderRadius: '50%', background: 'rgba(103,232,249,0.25)' }} />
    <div style={{ position: 'absolute', bottom: -192, left: -160, width: 620, height: 620, borderRadius: '50%', background: 'rgba(29,78,216,0.12)' }} />
    <div style={{ position: 'absolute', inset: 34, borderRadius: 22, border: '4px solid #facc15' }} />
    <div style={{ position: 'absolute', inset: 48, borderRadius: 16, border: '1px solid rgba(30,58,95,0.25)' }} />
    {/* Watermark */}
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', opacity: 0.045 }}>
      <div style={{ width: 430, height: 430, borderRadius: '50%', border: '30px solid #1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 90, fontWeight: 900, color: '#1e3a5f' }}>THS</div>
    </div>

    <div style={{ position: 'relative', zIndex: 10, height: '100%' }}>
      {/* Top bar */}
      <div style={{ position: 'absolute', top: 56, left: 80, right: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo />
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: '0.05em', color: '#1e3a5f' }}>{props.organizationName}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1e40af', marginTop: 4 }}>{props.districtName}</div>
        </div>
        <QrMini value={props.qrValue} dataUrl={props.qrDataUrl} />
      </div>

      {/* Title */}
      <div style={{ position: 'absolute', top: 180, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontSize: 62, fontWeight: 900, letterSpacing: '0.14em', color: '#1e3a5f' }}>SERTIFIKAT</div>
        <div style={{ marginTop: 4, fontSize: 34, fontWeight: 900, letterSpacing: '0.18em', color: '#ca8a04' }}>PENDADARAN</div>
        <div style={{ marginTop: 16, fontSize: 17, color: '#475569' }}>Nomor Sertifikat: {props.certificateNumber}</div>
      </div>

      {/* Recipient */}
      <div style={{ position: 'absolute', top: 345, left: 96, right: 96, textAlign: 'center', color: '#334155' }}>
        <div style={{ fontSize: 22 }}>Diberikan kepada</div>
        <div style={{ marginTop: 16, display: 'inline-block', padding: '16px 64px', borderRadius: 16, background: 'rgba(255,255,255,0.9)', border: '1px solid #bfdbfe' }}>
          <div style={{ fontSize: 48, fontWeight: 900, color: '#1e3a5f', letterSpacing: '0.05em' }}>{props.recipientName}</div>
        </div>
        <div style={{ marginTop: 28, fontSize: 24, lineHeight: 1.625 }}>
          atas kelulusan dalam kegiatan Pendadaran di <span style={{ fontWeight: 900, color: '#1e3a5f' }}>{props.location}</span>
        </div>
      </div>

      {/* Info boxes */}
      <div style={{ position: 'absolute', left: 96, right: 96, top: 540, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, fontSize: 18, color: '#334155' }}>
        <InfoBox label="Ranting" value={props.ranting} />
        <InfoBox label="Wilayah" value={props.wilayah} />
        <InfoBox label="Distrik" value={props.distrik} />
      </div>

      {/* Score boxes */}
      <div style={{ position: 'absolute', left: 96, right: 96, top: 640, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, textAlign: 'center' }}>
        <InfoBox label="Nilai Akhir" value={props.finalScore} highlight />
        <InfoBox label="Predikat" value={props.predicate} highlight />
        <InfoBox label="Status" value={props.status} highlight />
      </div>

      {/* Signers */}
      <div style={{ position: 'absolute', left: 96, right: 96, bottom: 80, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', textAlign: 'center', color: '#1e293b' }}>
        <SignerBlock title={props.signers.pastor.title} name={props.signers.pastor.name} />
        <div style={{ fontSize: 18, fontWeight: 600, color: '#475569', paddingBottom: 16 }}>{props.issuedPlaceDate}</div>
        <SignerBlock title={props.signers.koordinator.title} name={props.signers.koordinator.name} />
      </div>
    </div>
  </div>
);

const CertificateBack: React.FC<SertifikatPendadaranTemplateProps> = (props) => (
  <div style={{ position: 'relative', width: 1188, height: 840, background: 'linear-gradient(135deg, #ecfeff 0%, #ffffff 50%, #dbeafe 100%)', borderRadius: 28, overflow: 'hidden', border: '1px solid #cbd5e1' }}>
    <div style={{ position: 'absolute', top: -160, right: -144, width: 520, height: 520, borderRadius: '50%', background: 'rgba(103,232,249,0.25)' }} />
    <div style={{ position: 'absolute', bottom: -192, left: -160, width: 620, height: 620, borderRadius: '50%', background: 'rgba(29,78,216,0.12)' }} />
    <div style={{ position: 'absolute', inset: 34, borderRadius: 22, border: '4px solid #facc15' }} />
    <div style={{ position: 'absolute', inset: 48, borderRadius: 16, border: '1px solid rgba(30,58,95,0.25)' }} />
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', opacity: 0.045 }}>
      <div style={{ width: 430, height: 430, borderRadius: '50%', border: '30px solid #1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 90, fontWeight: 900, color: '#1e3a5f' }}>THS</div>
    </div>

    <div style={{ position: 'relative', zIndex: 10, height: '100%' }}>
      <div style={{ position: 'absolute', top: 64, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontSize: 40, fontWeight: 900, color: '#1e3a5f', letterSpacing: '0.12em' }}>RINCIAN PENILAIAN PENDADARAN</div>
        <div style={{ fontSize: 16, color: '#64748b', marginTop: 8 }}>Nilai item 55–90, nilai aspek dihitung dari rata-rata item</div>
      </div>

      {/* Aspects grid */}
      <div style={{ position: 'absolute', top: 145, left: 80, right: 80, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {props.aspects.map((aspect) => (
          <div key={aspect.name} style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid #bfdbfe', borderRadius: 16, padding: 16, minHeight: 136 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
              <div style={{ fontSize: 19, fontWeight: 900, color: '#1e3a5f' }}>{aspect.name}</div>
              <div style={{ padding: '4px 12px', borderRadius: '9999px', background: '#1e3a5f', color: 'white', fontSize: 14, fontWeight: 700 }}>Nilai: {aspect.score}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', fontSize: 13, color: '#334155' }}>
              {aspect.items.map((item) => (
                <div key={item} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>• {item}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary bar */}
      <div style={{ position: 'absolute', left: 80, right: 80, bottom: 80, background: 'linear-gradient(90deg, #172554, #1e40af, #0891b2)', borderRadius: 16, padding: 20, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 16, opacity: 0.9 }}>Ringkasan Hasil</div>
          <div style={{ fontSize: 26, fontWeight: 900, marginTop: 4 }}>Nilai Akhir {props.finalScore} · {props.predicate} · {props.status}</div>
          <div style={{ fontSize: 14, opacity: 0.9, marginTop: 8 }}>Predikat: 55–65 Cukup, 66–75 Baik, 76–90 Baik Sekali</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ textAlign: 'right', fontSize: 14, opacity: 0.95 }}>
            <div>Sertifikat tampil di detail profil user.</div>
            <div>Jika belum tersedia: Sertifikat Pendadaran tidak tersedia.</div>
          </div>
          <QrMini value={props.qrValue} dataUrl={props.qrDataUrl} />
        </div>
      </div>
    </div>
  </div>
);

const SertifikatPendadaranTemplate: React.FC<SertifikatPendadaranTemplateProps> = (props) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', padding: 32, background: '#f1f5f9' }}>
    <CertificateFront {...props} />
    <CertificateBack {...props} />
  </div>
);

export { SertifikatPendadaranTemplate, CertificateFront, CertificateBack };
