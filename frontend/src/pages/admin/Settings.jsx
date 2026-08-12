import React, { useState, useEffect } from 'react';
import { getSettingsApi, updateSettingApi } from '../../api/settings';
import { Settings, Save, CheckCircle2, Shield, Bell, Wrench, Mail, HardDrive, Clock } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const defaultSettings = {
    system_name: 'University Help Desk Management System (UHDMS)',
    support_email: 'support@uhdms.edu',
    allow_registration: true,
    maintenance_mode: false,
    auto_close_days: '7',
    sla_enforcement: true,
    max_attachment_mb: '5',
    email_notifications: true,
    default_sla_hours: '24',
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await getSettingsApi();
      if (res.data.success && res.data.data) {
        const obj = { ...defaultSettings };
        res.data.data.forEach((item) => {
          obj[item.key] = item.value;
        });
        setSettings(obj);
      } else {
        setSettings(defaultSettings);
      }
    } catch (err) {
      console.error(err);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const promises = Object.keys(settings).map((key) =>
        updateSettingApi(key, settings[key])
      );
      await Promise.all(promises);
      setMessage('System Settings saved successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      alert('Error saving settings: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Settings className="w-6 h-6 text-indigo-500" /> System Configuration & Settings
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Global application parameters, email options, SLA timers, auto-closure rules, and security controls.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {message}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading system configuration...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Section */}
          <div className="p-6 rounded-xl border space-y-4 shadow-md" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <h3 className="font-bold text-sm flex items-center gap-2 pb-2 border-b" style={{ color: 'var(--color-text)', borderColor: 'var(--color-border)' }}>
              <Wrench className="w-4 h-4 text-indigo-400" /> General Portal Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block mb-1 font-semibold" style={{ color: 'var(--color-text-muted)' }}>System Name / Branding</label>
                <input
                  type="text"
                  value={settings.system_name || ''}
                  onChange={(e) => handleChange('system_name', e.target.value)}
                  className="w-full p-2.5 rounded-lg border outline-none"
                  style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold" style={{ color: 'var(--color-text-muted)' }}>Support Email Address</label>
                <input
                  type="email"
                  value={settings.support_email || ''}
                  onChange={(e) => handleChange('support_email', e.target.value)}
                  className="w-full p-2.5 rounded-lg border outline-none"
                  style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div className="flex items-center gap-3 p-3 rounded-lg border" style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)' }}>
                <input
                  type="checkbox"
                  id="allow_reg"
                  checked={Boolean(settings.allow_registration)}
                  onChange={(e) => handleChange('allow_registration', e.target.checked)}
                  className="rounded border"
                />
                <div>
                  <label htmlFor="allow_reg" className="font-semibold cursor-pointer block" style={{ color: 'var(--color-text)' }}>Allow User Self-Registration</label>
                  <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Students can register accounts publicly</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg border" style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)' }}>
                <input
                  type="checkbox"
                  id="maint_mode"
                  checked={Boolean(settings.maintenance_mode)}
                  onChange={(e) => handleChange('maintenance_mode', e.target.checked)}
                  className="rounded border text-rose-500"
                />
                <div>
                  <label htmlFor="maint_mode" className="font-semibold cursor-pointer block text-rose-400">Enable Maintenance Mode</label>
                  <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Restrict student logins during database updates</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Automation & SLA */}
          <div className="p-6 rounded-xl border space-y-4 shadow-md" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <h3 className="font-bold text-sm flex items-center gap-2 pb-2 border-b" style={{ color: 'var(--color-text)', borderColor: 'var(--color-border)' }}>
              <Clock className="w-4 h-4 text-amber-400" /> Ticket Automation & SLA Rules
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block mb-1 font-semibold" style={{ color: 'var(--color-text-muted)' }}>Auto-Close Resolved Tickets (Days)</label>
                <input
                  type="number"
                  value={settings.auto_close_days || '7'}
                  onChange={(e) => handleChange('auto_close_days', e.target.value)}
                  className="w-full p-2.5 rounded-lg border outline-none"
                  style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold" style={{ color: 'var(--color-text-muted)' }}>Default Resolution SLA (Hours)</label>
                <input
                  type="number"
                  value={settings.default_sla_hours || '24'}
                  onChange={(e) => handleChange('default_sla_hours', e.target.value)}
                  className="w-full p-2.5 rounded-lg border outline-none"
                  style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold" style={{ color: 'var(--color-text-muted)' }}>Max Attachment Size (MB)</label>
                <input
                  type="number"
                  value={settings.max_attachment_mb || '5'}
                  onChange={(e) => handleChange('max_attachment_mb', e.target.value)}
                  className="w-full p-2.5 rounded-lg border outline-none"
                  style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg border text-xs" style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)' }}>
              <input
                type="checkbox"
                id="sla_enforce"
                checked={Boolean(settings.sla_enforcement)}
                onChange={(e) => handleChange('sla_enforcement', e.target.checked)}
                className="rounded border"
              />
              <div>
                <label htmlFor="sla_enforce" className="font-semibold cursor-pointer block" style={{ color: 'var(--color-text)' }}>Enforce SLA Policy Countdown & Breach Notifications</label>
                <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Automatically trigger escalation flags when response time breaches SLA</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-lg shadow-indigo-600/20 transition-all text-xs"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving Settings...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
