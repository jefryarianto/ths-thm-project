import React from 'react';

export interface KartuAnggotaTemplateProps {
  nama: string;
  nomorAnggota: string;
  ranting: string;
  wilayah: string;
  distrik: string;
  tempatTanggalLahir: string;
  dadar: string;
  status: string;
  validUntil: string;
  fotoUrl?: string;
  qrValue: string;
  qrDataUrl?: string;
  organizationName: string;
  signerName: string;
  signerTitle: string;
  levelLabel?: string;
  levelStripCount?: number;
}

const Logo: React.FC = () => (
  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fde047', border: '4px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'white', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: '#1e40af' }}>THS</div>
  </div>
);

const InfoRow: React.FC<{ label: string; value: string; strong?: boolean }> = ({ label, value, strong }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, marginTop: 12, alignItems: 'start' }}>
    <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f' }}>{label}</div>
    <div style={{ fontSize: strong ? 25 : 18, fontWeight: strong ? 900 : 600, color: strong ? '#1e3a5f' : '#1e293b' }}>: {value}</div>
  </div>
);

const BackRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '105px 1fr', gap: 8, fontSize: 18, marginBottom: 12 }}>
    <div style={{ fontWeight: 900, color: '#1e3a5f' }}>{label}</div>
    <div style={{ fontWeight: 600 }}>: {value}</div>
  </div>
);

const FrontCard: React.FC<KartuAnggotaTemplateProps> = (props) => (
  <div style={{ position: 'relative', width: 856, height: 540, background: 'linear-gradient(135deg, #ecfeff 0%, #ffffff 50%, #dbeafe 100%)', borderRadius: 28, overflow: 'hidden', border: '1px solid #cbd5e1' }}>
    {/* Decorative circles */}
    <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(103,232,249,0.3)' }} />
    <div style={{ position: 'absolute', bottom: -112, left: -80, width: 384, height: 384, borderRadius: '50%', background: 'rgba(29,78,216,0.15)' }} />
    {/* Header gradient */}
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 64, background: 'linear-gradient(90deg, #1e3a5f, #1d4ed8, #06b6d4)' }} />
    {/* Footer gradient */}
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(90deg, #172554, #1e40af, #0891b2)' }} />
    {/* Border */}
    <div style={{ position: 'absolute', inset: 18, borderRadius: 20, border: '2px solid rgba(250,204,21,0.8)' }} />
    {/* Watermark */}
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', opacity: 0.06 }}>
      <div style={{ width: 240, height: 240, borderRadius: '50%', border: '18px solid #1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, fontWeight: 900, color: '#1e3a5f' }}>THS</div>
    </div>

    {/* Content */}
    <div style={{ position: 'relative', zIndex: 10, padding: '24px 40px 0', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, color: 'white' }}>
        <Logo />
        <div style={{ lineHeight: 1.1, paddingTop: 4 }}>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '0.05em' }}>{props.organizationName}</div>
          <div style={{ fontSize: 17, fontWeight: 600, opacity: 0.95 }}>DISTRIK {props.distrik.toUpperCase()}</div>
        </div>
      </div>

      {/* Title */}
      <div style={{ position: 'absolute', top: 92, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ display: 'inline-block', padding: '8px 32px', borderRadius: '9999px', background: 'rgba(255,255,255,0.9)', border: '1px solid #eab308' }}>
          <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: '0.18em', color: '#1e3a5f' }}>KARTU TANDA ANGGOTA</span>
        </div>
      </div>

      {/* Photo placeholder */}
      <div style={{ position: 'absolute', left: 40, top: 165, width: 185, height: 235, borderRadius: 16, background: '#e2e8f0', border: '4px solid white', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {props.fotoUrl ? (
          <img src={props.fotoUrl} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #cbd5e1, #f1f5f9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 700, fontSize: 18 }}>FOTO</div>
        )}
      </div>

      {/* Level strips */}
      <div style={{ position: 'absolute', left: 40, top: 412, width: 185, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {Array.from({ length: props.levelStripCount ?? 2 }).map((_, i) => (
          <div key={i} style={{ height: 14, borderRadius: 4, background: '#1d4ed8', border: '1px solid #1e3a5f' }} />
        ))}
      </div>

      {/* Info */}
      <div style={{ position: 'absolute', left: 255, top: 162, right: 40, color: '#1e293b' }}>
        <InfoRow label="Nama" value={props.nama} strong />
        <InfoRow label="No. Anggota" value={props.nomorAnggota} />
        <InfoRow label="Ranting" value={props.ranting} />
        <InfoRow label="Wilayah" value={props.wilayah} />
        <InfoRow label="Distrik" value={props.distrik} />
      </div>

      {/* Footer */}
      <div style={{ position: 'absolute', left: 40, bottom: '40px', color: 'white' }}>
        <div style={{ fontSize: 15, opacity: 0.9 }}>Berlaku sampai</div>
        <div style={{ fontSize: 22, fontWeight: 900 }}>{props.validUntil}</div>
      </div>

      <div style={{ position: 'absolute', right: 48, bottom: '36px', textAlign: 'center', color: 'white' }}>
        <div style={{ position: 'relative', height: 80, width: 192 }}>
          <div style={{ position: 'absolute', left: 32, top: 0, fontSize: 36, fontFamily: 'cursive', transform: 'rotate(-8deg)', color: 'rgba(15,23,42,0.8)' }}>ttd</div>
          <div style={{ position: 'absolute', right: 0, top: 0, width: 80, height: 80, borderRadius: '50%', border: '4px solid rgba(191,219,254,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: 'rgba(191,219,254,0.8)', transform: 'rotate(-12deg)' }}>STEMPEL</div>
        </div>
        <div style={{ fontSize: 16, fontWeight: 900, borderTop: '1px solid rgba(255,255,255,0.6)', paddingTop: 4 }}>{props.signerName}</div>
        <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.95 }}>{props.signerTitle}</div>
      </div>
    </div>
  </div>
);

const BackCard: React.FC<KartuAnggotaTemplateProps> = (props) => {
  const qrImg = props.qrDataUrl
    ? React.createElement('img', { src: props.qrDataUrl, alt: 'QR', style: { width: '100%', height: '100%', objectFit: 'contain' } })
    : React.createElement('div', { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#64748b' } }, `QR: ${props.qrValue}`);

  return (
  <div style={{ position: 'relative', width: 856, height: 540, background: 'linear-gradient(135deg, #ecfeff 0%, #ffffff 50%, #dbeafe 100%)', borderRadius: 28, overflow: 'hidden', border: '1px solid #cbd5e1' }}>
    {/* Decorative circles */}
    <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(103,232,249,0.3)' }} />
    <div style={{ position: 'absolute', bottom: -112, left: -80, width: 384, height: 384, borderRadius: '50%', background: 'rgba(29,78,216,0.15)' }} />
    {/* Header gradient */}
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 64, background: 'linear-gradient(90deg, #1e3a5f, #1d4ed8, #06b6d4)' }} />
    {/* Footer gradient */}
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(90deg, #172554, #1e40af, #0891b2)' }} />
    {/* Border */}
    <div style={{ position: 'absolute', inset: 18, borderRadius: 20, border: '2px solid rgba(250,204,21,0.8)' }} />
    {/* Watermark */}
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', opacity: 0.06 }}>
      <div style={{ width: 240, height: 240, borderRadius: '50%', border: '18px solid #1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, fontWeight: 900, color: '#1e3a5f' }}>THS</div>
    </div>

    <div style={{ position: 'relative', zIndex: 10, height: '100%' }}>
      {/* Header */}
      <div style={{ position: 'absolute', top: 28, left: 0, right: 0, textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '0.16em' }}>VERIFIKASI KARTU ANGGOTA</div>
        <div style={{ fontSize: 15, opacity: 0.9, marginTop: 4 }}>Scan QR untuk memeriksa keabsahan anggota</div>
      </div>

      {/* QR Code */}
      <div style={{ position: 'absolute', left: 48, top: 145, width: 210, height: 210, background: 'white', borderRadius: 16, border: '4px solid #1e3a5f', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: 16 }}>
        {qrImg}
      </div>

      {/* Info */}
      <div style={{ position: 'absolute', left: 300, top: 145, right: 48, color: '#1e293b' }}>
        <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: 16, border: '1px solid #bfdbfe', padding: 24 }}>
          <p style={{ fontSize: 18, lineHeight: 1.625, color: '#334155', marginBottom: 16 }}>
            Halaman verifikasi publik hanya menampilkan data minimum untuk membuktikan keabsahan anggota.
          </p>
          <BackRow label="TTL" value={props.tempatTanggalLahir} />
          <BackRow label="DADAR" value={props.dadar} />
          <BackRow label="Status" value={props.status} />
          <BackRow label="Valid s/d" value={props.validUntil} />
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: 'absolute', left: 48, right: 48, bottom: '32px', color: 'white', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
        <div style={{ maxWidth: 610, fontSize: 15, lineHeight: 1.625, opacity: 0.95 }}>
          Jika kartu ini ditemukan, harap menghubungi sekretariat THS-THM Distrik {props.distrik}.
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, opacity: 0.8 }}>URL Verifikasi</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>/verify/member/{props.qrValue}</div>
        </div>
      </div>
    </div>
  </div>
  );
};

const KartuAnggotaTemplate: React.FC<KartuAnggotaTemplateProps> = (props) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', padding: 32, background: '#f1f5f9' }}>
    <FrontCard {...props} />
    <BackCard {...props} />
  </div>
);

export { KartuAnggotaTemplate, FrontCard, BackCard };
