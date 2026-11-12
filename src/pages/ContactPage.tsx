import { useEffect, useState } from 'react';
import Panel from '@/ui/Panel';
import { useStore } from '@/state/useStore';
import { useT } from '@/i18n';
import { CONTACT } from '@/config/site';
import { detectMobile } from '@/utils/device';
import { QRCodeSVG } from 'qrcode.react';
import './contact.css';

type CopyField = 'wechat' | 'phone' | null;
/** 二维码来源：官方图片 > 微信号文本 > 未配置 */
type QrSource = 'image' | 'id' | 'none';

export default function ContactPage() {
  const t = useT();
  const setFlight = useStore((s) => s.setFlight);
  const setActive = useStore((s) => s.setActivePlanet);
  const isMobile = detectMobile();
  const [copied, setCopied] = useState<CopyField>(null);
  const [imgFailed, setImgFailed] = useState(false);

  const hasCard = !!CONTACT.wechatCardUrl;
  const hasImage = !!CONTACT.wechatQrImage && !imgFailed;
  const hasRealId = !!CONTACT.wechatId && CONTACT.wechatId !== 'YOUR_WECHAT_ID';
  // 二维码只编码官方原图或微信号文本：u.wechat.com 链接脱离微信环境会跳下载页，不入码
  const qrSource: QrSource = hasImage ? 'image' : hasRealId ? 'id' : 'none';
  const qrValue = CONTACT.wechatId;
  // 只把「明显还是模板占位」判为未配置；wechatId 留空是允许的（有名片链接即可）
  const hasPlaceholder =
    CONTACT.wechatId === 'YOUR_WECHAT_ID' ||
    CONTACT.phoneTel === '+8613800000000';

  useEffect(() => {
    setActive('contact');
    if (useStore.getState().flight !== 'FLYING_IN') {
      setFlight('VIEWING');
    }
  }, [setActive, setFlight]);

  const onReturn = () => {
    useStore.getState().dispatch({ type: 'RETURN' });
  };

  const flash = (field: CopyField) => {
    setCopied(field);
    window.setTimeout(() => setCopied((c) => (c === field ? null : c)), 1600);
  };

  const copy = async (text: string, field: CopyField) => {
    try {
      await navigator.clipboard.writeText(text);
      flash(field);
    } catch {
      flash(field);
    }
  };

  /**
   * 手机端主按钮：
   *  - 有 u.wechat.com 名片链接 → 真机上交给系统 Universal Link 拦截唤起微信
   *    （该链接在外部浏览器打开只会跳微信下载页，因此不提供「复制名片链接」入口）
   *  - 没有 → 老实退化为「复制微信号」（weixin://dl/addfriend 微信官方不支持，不做假承诺）
   */
  const openWechat = () => {
    if (hasCard) {
      window.location.href = CONTACT.wechatCardUrl;
    } else if (CONTACT.wechatId) {
      void copy(CONTACT.wechatId, 'wechat');
    }
  };

  return (
    <Panel
      title={t.contact.heading}
      sub={t.contact.sub}
      onReturn={onReturn}
      returnLabel={t.return}
    >
      <div className="contact" data-mobile={isMobile ? 'true' : 'false'}>
        {/* 手机端：直达动作 */}
        {isMobile && (
          <div className="contact__actions">
            <button
              type="button"
              className="contact__action contact__action--wechat"
              onClick={openWechat}
            >
              <span className="contact__action-ico" aria-hidden="true">💬</span>
              {hasCard ? t.contact.openWechat : t.contact.copyId}
            </button>
            <a
              className="contact__action contact__action--phone"
              href={`tel:${CONTACT.phoneTel}`}
            >
              <span className="contact__action-ico" aria-hidden="true">📞</span>
              {t.contact.call}
            </a>
          </div>
        )}

        <div className="contact__grid">
          {/* 微信二维码：电脑端扫码添加；手机端长按 / 截图识别 */}
          <div className="contact__qr">
            <div className="contact__qr-frame" data-qr={qrSource}>
              {qrSource === 'image' && (
                <img
                  className="contact__qr-img"
                  src={CONTACT.wechatQrImage}
                  alt={t.contact.scan}
                  width={isMobile ? 200 : 220}
                  height={isMobile ? 200 : 220}
                  onError={() => setImgFailed(true)}
                />
              )}
              {qrSource === 'id' && (
                <QRCodeSVG
                  value={qrValue}
                  size={isMobile ? 184 : 200}
                  bgColor="#0b0f1c"
                  fgColor="#dff3ff"
                  level="M"
                  marginSize={2}
                />
              )}
              {qrSource === 'none' && (
                <div className="contact__qr-stub">{t.contact.qrMissing}</div>
              )}
            </div>
            <p className="contact__qr-cap">
              {qrSource === 'id' ? t.contact.scanId : t.contact.scan}
            </p>
            {isMobile && qrSource !== 'none' && (
              <p className="contact__qr-hint">{t.contact.qrHintMobile}</p>
            )}
            {isMobile && qrSource === 'image' && (
              <div className="contact__qr-tools">
                <a
                  className="contact__save"
                  href={CONTACT.wechatQrImage}
                  download="wechat-qr.png"
                >
                  {t.contact.saveQr}
                </a>
              </div>
            )}
          </div>

          {/* 明细：微信号 / 电话 / 邮箱（邮箱留空不展示） */}
          <div className="contact__details">
            {CONTACT.wechatId && (
              <div className="contact__row">
                <span className="contact__k">{t.contact.wechat}</span>
                <span className="contact__v contact__v--mono">{CONTACT.wechatId}</span>
                <button
                  type="button"
                  className="contact__copy"
                  onClick={() => void copy(CONTACT.wechatId, 'wechat')}
                >
                  {copied === 'wechat' ? t.contact.copied : t.contact.copyId}
                </button>
              </div>
            )}

            <div className="contact__row">
              <span className="contact__k">{t.contact.phone}</span>
              <a className="contact__v contact__v--mono" href={`tel:${CONTACT.phoneTel}`}>
                {CONTACT.phone}
              </a>
              {!isMobile && (
                <button
                  type="button"
                  className="contact__copy"
                  onClick={() => void copy(CONTACT.phoneTel, 'phone')}
                >
                  {copied === 'phone' ? t.contact.copied : t.contact.copyPhone}
                </button>
              )}
            </div>

            {CONTACT.email && (
              <div className="contact__row">
                <span className="contact__k">{t.contact.email}</span>
                <a className="contact__v contact__v--mono" href={`mailto:${CONTACT.email}`}>
                  {CONTACT.email}
                </a>
              </div>
            )}
          </div>
        </div>

        {!isMobile && <p className="contact__hint">{t.contact.wechatHint}</p>}
        {!hasCard && <p className="contact__hint">{t.contact.noCardHint}</p>}
        {hasPlaceholder && <p className="contact__warn">{t.contact.placeholder}</p>}
      </div>
    </Panel>
  );
}
