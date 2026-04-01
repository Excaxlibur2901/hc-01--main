import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import * as api from '../services/api';

export default function Emergency() {
  const pageRef = useRef(null);

  const [form, setForm] = useState({ patientName: '', condition: '', lat: '', lng: '' });
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);

  useEffect(() => {
    if (!pageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('[data-gsap-emergency]', {
        y: 24,
        opacity: 0,
        duration: 0.62,
        ease: 'power2.out',
        stagger: 0.1,
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported in this browser.');
    }

    setLocationLoading(true);
    try {
      const coords = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position.coords),
          () => reject(new Error('Unable to fetch location.')),
          { timeout: 15000, enableHighAccuracy: true, maximumAge: 300000 }
        );
      });

      setForm((prev) => ({
        ...prev,
        lat: String(coords.latitude),
        lng: String(coords.longitude),
      }));
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setResults(null);
    setSelectedHospital(null);

    if (!form.patientName.trim() || !form.condition.trim()) {
      setError('Patient name and condition are required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        patientName: form.patientName.trim(),
        condition: form.condition.trim(),
        lat: form.lat ? Number(form.lat) : undefined,
        lng: form.lng ? Number(form.lng) : undefined,
      };

      const response = await api.getEmergencyRedirect(payload);
      setResults(response);
    } catch (requestError) {
      setError(requestError.message || 'Failed to get recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHospital = async (hospital) => {
    setSelectedHospital(hospital);

    if (!results?.caseId) return;

    try {
      await api.selectHospital({
        caseId: results.caseId,
        hospitalName: hospital.name,
        hospitalDistance: hospital.distance,
        hospitalAddress: hospital.address,
      });
    } catch (selectionError) {
      console.error(selectionError);
    }
  };

  return (
    <section ref={pageRef} className="grid gap-8 lg:grid-cols-12">
      <div data-gsap-emergency className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40">
        <h1 className="text-2xl font-black text-slate-900">Emergency Redirect</h1>
        <p className="mt-1 text-sm text-slate-600">Find best hospitals from backend recommendation engine.</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-semibold text-slate-700">Patient Name</span>
            <input
              type="text"
              className="input-field"
              value={form.patientName}
              onChange={(event) => setForm((prev) => ({ ...prev, patientName: event.target.value }))}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-semibold text-slate-700">Condition</span>
            <textarea
              className="input-field min-h-24"
              value={form.condition}
              onChange={(event) => setForm((prev) => ({ ...prev, condition: event.target.value }))}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-sm font-semibold text-slate-700">Latitude</span>
              <input
                type="number"
                step="any"
                className="input-field"
                value={form.lat}
                onChange={(event) => setForm((prev) => ({ ...prev, lat: event.target.value }))}
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-semibold text-slate-700">Longitude</span>
              <input
                type="number"
                step="any"
                className="input-field"
                value={form.lng}
                onChange={(event) => setForm((prev) => ({ ...prev, lng: event.target.value }))}
              />
            </label>
          </div>

          <button type="button" className="btn-outline w-full py-2" onClick={getCurrentLocation} disabled={locationLoading}>
            {locationLoading ? 'Detecting location...' : 'Use current location'}
          </button>

          {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          <button type="submit" className="btn-danger w-full py-3 font-bold" disabled={loading}>
            {loading ? 'Analyzing...' : 'Find Hospitals'}
          </button>
        </form>
      </div>

      <div data-gsap-emergency className="lg:col-span-8">
        {!results && !loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-lg shadow-slate-200/40">
            Submit patient details to get backend hospital recommendations.
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-lg shadow-slate-200/40">
            Processing recommendation request...
          </div>
        ) : null}

        {results ? (
          <div className="space-y-4">
            {results.bestHospital ? (
              <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-sky-700">Top recommendation</p>
                <h2 className="mt-1 text-2xl font-black text-slate-900">{results.bestHospital.name}</h2>
                <p className="mt-1 text-sm text-slate-600">{results.bestHospital.address}</p>
              </div>
            ) : null}

            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/40">
              <h3 className="text-lg font-bold text-slate-900">All Suggestions</h3>
              {results.allSuggestions?.map((hospital, index) => (
                <button
                  key={`${hospital.name}-${index}`}
                  type="button"
                  onClick={() => handleSelectHospital(hospital)}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    selectedHospital?.name === hospital.name
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">{hospital.name}</p>
                      <p className="text-xs text-slate-500">{hospital.address}</p>
                    </div>
                    <div className="text-right text-xs text-slate-600">
                      <p>{hospital.distance} km</p>
                      <p>{hospital.availability}% available</p>
                      <p>score {hospital.score}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
