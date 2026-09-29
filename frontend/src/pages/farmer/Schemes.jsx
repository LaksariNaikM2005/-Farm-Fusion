import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  FaFileContract, 
  FaExternalLinkAlt, 
  FaHandHoldingUsd, 
  FaMoneyCheckAlt, 
  FaShieldAlt, 
  FaSeedling,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCheckDouble
} from 'react-icons/fa';
import { format } from 'date-fns';

const CATEGORY_ICONS = {
  subsidy: FaHandHoldingUsd,
  loan: FaMoneyCheckAlt,
  insurance: FaShieldAlt,
  crop_support: FaSeedling,
  other: FaFileContract
};

export default function Schemes() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedScheme, setSelectedScheme] = useState(null);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const { data } = await api.get('/schemes');
        setSchemes(data.schemes);
        if (data.schemes.length > 0) {
          setSelectedScheme(data.schemes[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner"></div></div>;

  return (
    <div className="fade-in max-w-7xl mx-auto">
      <div className="page-header mb-6">
        <h1 className="page-title flex items-center gap-2"><FaFileContract className="text-gold" /> Government Schemes</h1>
        <p className="page-subtitle">Discover subsidies, loans, and support programs available for farmers.</p>
      </div>

      {schemes.length === 0 ? (
        <div className="empty-state">
          <FaFileContract className="empty-icon" />
          <h3>No active schemes found</h3>
        </div>
      ) : (
        <div className="master-detail-container">
          {/* Master List (Left Sidebar) */}
          <div className="master-list">
            {schemes.map(scheme => {
              const Icon = CATEGORY_ICONS[scheme.category] || FaFileContract;
              return (
                <div 
                  key={scheme._id} 
                  className={`scheme-item ${selectedScheme?._id === scheme._id ? 'active' : ''}`}
                  onClick={() => setSelectedScheme(scheme)}
                >
                  <div className="large-icon-wrapper">
                    <Icon />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="text-sm font-bold truncate mb-1">{scheme.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-gold !text-[10px] !py-0">{scheme.category}</span>
                      <span className="text-[10px] text-text-muted flex items-center gap-1">
                        <FaMapMarkerAlt /> {scheme.state}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail Pane (Right Content) */}
          <div className="detail-pane slide-in">
            {selectedScheme && (
              <>
                <div className="detail-header">
                  <div className="flex justify-between items-start mb-6">
                    <span className="badge badge-gold px-4 py-1 text-sm">{selectedScheme.category}</span>
                    <span className="text-xs font-semibold px-3 py-1 bg-bg-elevated rounded-full border border-border flex items-center gap-2">
                      <FaMapMarkerAlt className="text-gold" /> {selectedScheme.state}
                    </span>
                  </div>
                  <h2 className="text-3xl font-black text-text-primary leading-tight mb-4">{selectedScheme.title}</h2>
                  <div className="flex items-center gap-6 text-sm text-text-secondary">
                    {selectedScheme.deadline && (
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-warning" />
                        <span>Deadline: <strong className="text-warning">{format(new Date(selectedScheme.deadline), 'MMM dd, yyyy')}</strong></span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <FaCheckDouble className="text-primary-light" />
                      <span>Verified Program</span>
                    </div>
                  </div>
                </div>

                <div className="detail-content flex-1">
                  <div className="mb-10">
                    <h4 className="text-lg font-bold mb-3 flex items-center gap-2 text-primary-light">
                      About the Scheme
                    </h4>
                    <p className="text-text-secondary leading-relaxed text-lg">
                      {selectedScheme.description}
                    </p>
                  </div>

                  <div className="info-grid">
                    <div className="info-box">
                      <p className="info-box-label">Eligibility Criteria</p>
                      <p className="text-text-primary text-sm leading-relaxed">
                        {selectedScheme.eligibility}
                      </p>
                    </div>
                    
                    <div className="info-box">
                      <p className="info-box-label">Required Documents</p>
                      <ul className="text-text-primary text-sm space-y-1">
                        <li>• Land ownership documents</li>
                        <li>• Aadhaar Card / ID Proof</li>
                        <li>• Bank account details</li>
                        <li>• Farmer Certificate (KCC)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-12 p-8 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <h4 className="text-xl font-bold mb-1">Ready to apply?</h4>
                      <p className="text-sm text-text-secondary">Click the button below to visit the official portal and start your application.</p>
                    </div>
                    {selectedScheme.link && (
                      <a href={selectedScheme.link} target="_blank" rel="noreferrer" className="btn btn-primary btn-lg !px-10">
                        Apply Now <FaExternalLinkAlt className="ml-2" />
                      </a>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
