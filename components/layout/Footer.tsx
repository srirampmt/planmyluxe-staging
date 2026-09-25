"use client";

import React from 'react'
import Link from 'next/link'
import EnquiryModal from '../hotels/EnquiryModal';
import StatusModal from '../groupbookings/StatusModal';
import PhoneNumber from '@/components/utm/PhoneNumber';
import { buildEnquirySource } from '@/lib/source-builder';
import { markThankyouUrl, restoreThankyouUrl } from "@/lib/thankyou-url";

const Footer = () => {
  const [isEnquiryOpen, setIsEnquiryOpen] = React.useState(false);
  const [pageRoute, setPageRoute] = React.useState('');

  const [newsletterFullName, setNewsletterFullName] = React.useState('');
  const [newsletterEmail, setNewsletterEmail] = React.useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = React.useState(false);
  const [newsletterStatus, setNewsletterStatus] = React.useState<{
    open: boolean;
    variant: 'success' | 'error';
    message: string;
  }>({ open: false, variant: 'success', message: '' });

  const handleEnquireNow = () => {
    if (typeof window !== 'undefined') {
      setPageRoute(`${window.location.pathname}${window.location.search}`);
    }
    setIsEnquiryOpen(true);
  };

  const handleCloseEnquiry = () => {
    setIsEnquiryOpen(false);
  };

  const handleNewsletterClose = () => {
    restoreThankyouUrl();
    setNewsletterStatus((prev) => ({ ...prev, open: false }));
  };

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newsletterSubmitting) return;

    const fullName = newsletterFullName.trim();
    const email = newsletterEmail.trim();

    if (!fullName || !email) {
      setNewsletterStatus({
        open: true,
        variant: 'error',
        message: 'Please enter your full name and email address.',
      });
      return;
    }

    setNewsletterSubmitting(true);

    try {
      const payload = { fullName, email };

      const res = await fetch('/api/submit-newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await res.json().catch(() => null)
        : null;

      if (!res.ok) {
        const msg = data?.error || data?.message || `Request failed with status ${res.status} ${res.statusText}`;
        setNewsletterStatus({ open: true, variant: 'error', message: msg });
        return;
      }

      if (data && data.success === false) {
        setNewsletterStatus({
          open: true,
          variant: 'error',
          message: data?.error || data?.message || 'Something went wrong. Please try again.',
        });
        return;
      }

      setNewsletterFullName('');
      setNewsletterEmail('');
      markThankyouUrl();
      setNewsletterStatus({
        open: true,
        variant: 'success',
        message: "You're subscribed! Thank you — you’ll now receive our weekly offers.",
      });
    } catch {
      setNewsletterStatus({
        open: true,
        variant: 'error',
        message: 'Failed to submit. Please try again.',
      });
    } finally {
      setNewsletterSubmitting(false);
    }
  };
  return (
    <>
      <EnquiryModal
        open={isEnquiryOpen}
        onClose={handleCloseEnquiry}
        initialValues={{
          destination: "",
          resort: "",
          quoteRef: "",
          dealdata: null,
          source: buildEnquirySource({ section: "footer", pathname: pageRoute }),
        }}
      />
      <StatusModal
        open={newsletterStatus.open}
        onClose={handleNewsletterClose}
        title="Newsletter"
        variant={newsletterStatus.variant}
        message={newsletterStatus.message}
      />
      <footer className="bg-[#666666] text-white overflow-hidden">
        <div className="w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] lg:px-[40px]">
          <div className="w-full max-w-[1280px] mx-auto pt-8 pb-4">
            {/* Header Section */}
            <div className="flex flex-wrap items-center gap-8 mb-6">
              {/* Logo */}
              <div className="flex-shrink-0">
                <svg width="160" height="27" viewBox="0 0 160 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.87875 19.8696V1.53083H9.08528C14.0766 1.53083 16.2918 4.2508 16.2918 7.98025C16.2918 11.7097 14.0766 14.4577 9.08528 14.4577H6.42139V19.8696H1.87875ZM6.42139 10.2516H9.1694C11.1042 10.2516 11.6931 9.29818 11.6931 7.98025C11.6931 6.69037 11.1042 5.73697 9.1694 5.73697H6.42139V10.2516ZM18.7471 19.8696V1.53083H23.2898V15.6635H31.9545V19.8696H18.7471ZM34.1263 19.8696V9.21406C34.1263 4.22276 36.9584 1.16629 42.1741 1.16629C47.4177 1.16629 50.2779 4.22276 50.2779 9.21406V19.8696H45.7353V14.654H38.5568V19.8696H34.1263ZM38.5568 10.7283H45.7353V9.21406C45.7353 6.69037 44.6417 5.37244 42.146 5.37244C39.6784 5.37244 38.5568 6.69037 38.5568 9.21406V10.7283ZM53.1861 19.8696V8.87756C53.1861 4.13864 55.9902 1.16629 61.0375 1.16629C66.0849 1.16629 68.889 4.13864 68.889 8.87756V19.8696H64.3464V8.87756C64.3464 6.63428 63.2808 5.37244 61.0375 5.37244C58.7943 5.37244 57.7287 6.63428 57.7287 8.87756V19.8696H53.1861Z" fill="white" />
                  <path d="M78.207 20.1476L73.0377 20.1476C70.8526 20.1476 69.8786 18.874 69.8786 17.2258C69.8786 16.2394 70.2657 15.4527 71.0024 14.9658C70.2657 14.4788 69.8786 13.6921 69.8786 12.7057C69.8786 11.0575 70.8526 9.78393 73.0377 9.78393L78.207 9.78393L78.207 11.8067L73.0377 11.8067C72.0887 11.8067 71.7516 12.2687 71.7516 12.8805C71.7516 13.4799 72.0887 13.9544 73.0377 13.9544L78.207 13.9544L78.207 15.9771L73.0377 15.9771C72.0887 15.9771 71.7516 16.4516 71.7516 17.051C71.7516 17.6628 72.0887 18.1248 73.0377 18.1248L78.207 18.1248L78.207 20.1476ZM78.207 6.61649L74.8232 6.61649L70.041 9.60073L70.041 7.21584L72.9128 5.6051L70.041 3.99436L70.041 1.65942L74.7608 4.59371L78.207 4.59371L78.207 6.61649Z" fill="white" />
                  <path d="M81.9873 22.0951C84.8273 20.6656 87.6673 20.6656 90.5074 22.0951C93.3474 23.5247 96.1874 23.5247 99.0274 22.0951" stroke="white" strokeWidth="1.11679" strokeLinecap="round" />
                  <path d="M81.9873 19.474C84.8273 18.0445 87.6673 18.0445 90.5074 19.474C93.3474 20.9036 96.1874 20.9036 99.0274 19.474" stroke="white" strokeWidth="1.11679" strokeLinecap="round" />
                  <rect x="81.4199" y="0.291016" width="2.08037" height="19.2327" fill="white" />
                  <path d="M108.415 17.1963H107.938C103.115 17.1963 100.788 14.925 100.788 10.7469V3.1758H102.891V10.4665C102.891 13.6912 104.769 15.5419 108.835 15.5419H109.312C113.041 15.5419 115.509 13.551 115.509 10.4665V3.1758H117.612V17H115.509V14.5044H114.78C113.714 16.0186 111.639 17.1963 108.415 17.1963ZM120.352 3.1758H123.072L129.185 8.22317H130.699L136.812 3.1758H139.251L131.232 9.87759L139.7 17H137.064L130.503 11.56H128.988L122.623 17H120.156L128.428 9.87759L120.352 3.1758ZM149.35 2.97951H150.192C155.015 2.97951 158.968 5.27887 158.968 9.90563V10.4384H142.508C142.564 13.9155 145.397 15.7382 149.35 15.7382H150.192C153.781 15.7382 156.276 14.5324 156.921 12.177H158.856C158.239 15.1493 155.267 17.1963 150.192 17.1963H149.35C144.443 17.1963 140.545 14.953 140.545 10.186V9.90563C140.545 5.27887 144.415 2.97951 149.35 2.97951ZM149.35 4.43764C145.509 4.43764 142.761 6.03598 142.536 9.17657H156.977C156.753 6.06402 153.865 4.43764 150.192 4.43764H149.35Z" fill="white" />
                  <path d="M101.585 20.1371H102.125V24.3923H106.177V24.834H101.585V20.1371ZM108.153 24.8831H108.033C106.828 24.8831 106.246 24.3152 106.246 23.2707V21.3779H106.772V23.2006C106.772 24.0068 107.241 24.4695 108.258 24.4695H108.377C109.309 24.4695 109.926 23.9717 109.926 23.2006V21.3779H110.452V24.834H109.926V24.2101H109.744C109.478 24.5886 108.959 24.8831 108.153 24.8831ZM110.856 21.3779H111.536L113.065 22.6398H113.443L114.972 21.3779H115.581L113.576 23.0534L115.694 24.834H115.035L113.394 23.474H113.016L111.424 24.834H110.807L112.875 23.0534L110.856 21.3779ZM117.785 24.8831H117.666C116.46 24.8831 115.879 24.3152 115.879 23.2707V21.3779H116.404V23.2006C116.404 24.0068 116.874 24.4695 117.891 24.4695H118.01C118.942 24.4695 119.559 23.9717 119.559 23.2006V21.3779H120.085V24.834H119.559V24.2101H119.377C119.11 24.5886 118.592 24.8831 117.785 24.8831ZM122.775 21.3289C123.777 21.3289 124.338 21.8056 124.338 22.7449V23.0183H123.854V22.7449C123.854 22.1 123.392 21.7425 122.578 21.7425C121.702 21.7425 121.211 22.1 121.211 22.7449V24.834H120.686V21.3779H121.211V21.8687H121.373C121.646 21.5251 122.088 21.3289 122.775 21.3289ZM124.368 21.3779H124.943L126.752 24.0839H127.095L128.701 21.3779H129.198L126.149 26.5164H125.651L126.654 24.827L124.368 21.3779ZM132.987 19.5973H133.198C134.2 19.5973 134.838 19.9899 134.838 20.8101V20.8872H134.333V20.8101C134.333 20.2142 133.885 19.9549 133.191 19.9549H132.98C132.286 19.9549 131.838 20.2212 131.838 20.8872V21.3779H133.681V21.7495H131.838V24.834H131.312V21.7495H130.681V21.3779H131.312V20.8872C131.312 19.9899 131.978 19.5973 132.987 19.5973ZM135.909 21.3289H136.119C137.367 21.3289 138.369 21.9317 138.369 23.0674V23.1375C138.369 24.3012 137.367 24.8831 136.119 24.8831H135.909C134.661 24.8831 133.651 24.2942 133.651 23.1375V23.0674C133.651 21.9317 134.654 21.3289 135.909 21.3289ZM135.909 21.7355C134.899 21.7355 134.177 22.2332 134.177 23.0674V23.1375C134.177 23.9787 134.899 24.4765 135.909 24.4765H136.119C137.128 24.4765 137.843 23.9787 137.843 23.1375V23.0674C137.843 22.2332 137.128 21.7355 136.119 21.7355H135.909ZM140.993 21.3289C141.996 21.3289 142.556 21.8056 142.556 22.7449V23.0183H142.073V22.7449C142.073 22.1 141.61 21.7425 140.797 21.7425C139.92 21.7425 139.43 22.1 139.43 22.7449V24.834H138.904V21.3779H139.43V21.8687H139.591C139.864 21.5251 140.306 21.3289 140.993 21.3289ZM144.429 19.6464H144.955V24.834H144.429V19.6464ZM147.69 21.3289H147.9C149.106 21.3289 150.095 21.9037 150.095 23.0604V23.1936H145.98C145.994 24.0629 146.702 24.5185 147.69 24.5185H147.9C148.798 24.5185 149.422 24.2171 149.583 23.6282H150.067C149.912 24.3713 149.169 24.8831 147.9 24.8831H147.69C146.463 24.8831 145.489 24.3222 145.489 23.1305V23.0604C145.489 21.9037 146.456 21.3289 147.69 21.3289ZM147.69 21.6934C146.73 21.6934 146.043 22.093 145.987 22.8781H149.597C149.541 22.1 148.819 21.6934 147.9 21.6934H147.69ZM152.49 21.3289H152.7C153.794 21.3289 154.663 21.6513 154.663 22.4575V22.5767H154.137V22.4575C154.137 21.8967 153.486 21.6583 152.7 21.6583H152.49C151.684 21.6583 151.081 21.8476 151.081 22.2893C151.081 22.794 151.593 22.8641 152.728 22.9342C154.257 23.0183 154.74 23.2497 154.74 23.8596V23.8946C154.74 24.5466 154.06 24.8831 152.714 24.8831H152.504C151.158 24.8831 150.485 24.5325 150.485 23.8035V23.6773H151.011V23.7965C151.011 24.3082 151.495 24.5466 152.504 24.5466H152.714C153.752 24.5466 154.215 24.3363 154.215 23.9016C154.215 23.446 153.808 23.3198 152.49 23.2497C151.207 23.1796 150.555 23.0113 150.555 22.3243V22.2893C150.555 21.6163 151.425 21.3289 152.49 21.3289ZM157.07 21.3289H157.281C158.374 21.3289 159.243 21.6513 159.243 22.4575V22.5767H158.718V22.4575C158.718 21.8967 158.066 21.6583 157.281 21.6583H157.07C156.264 21.6583 155.661 21.8476 155.661 22.2893C155.661 22.794 156.173 22.8641 157.309 22.9342C158.837 23.0183 159.321 23.2497 159.321 23.8596V23.8946C159.321 24.5466 158.641 24.8831 157.295 24.8831H157.084C155.738 24.8831 155.065 24.5325 155.065 23.8035V23.6773H155.591V23.7965C155.591 24.3082 156.075 24.5466 157.084 24.5466H157.295C158.332 24.5466 158.795 24.3363 158.795 23.9016C158.795 23.446 158.388 23.3198 157.07 23.2497C155.787 23.1796 155.135 23.0113 155.135 22.3243V22.2893C155.135 21.6163 156.005 21.3289 157.07 21.3289Z" fill="white" />
                </svg>
              </div>
              
              {/* ATOL Badge */}
              <div className="flex items-center gap-2 text-sm">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_atol)">
                    <path d="M16.7015 13.6654C16.7015 13.6654 13.9297 13.609 12.5703 10.9013C10.6459 7.11958 14.6077 5.08789 14.6077 5.08789L18.1174 5.70761L16.7015 13.6654Z" fill="white" />
                    <path d="M8.09961 14.5672L8.66456 14.6799L8.49508 14.1729L8.09961 14.5672ZM12.9088 14.8489C12.7393 14.7926 12.5698 14.8489 12.4568 14.8489C12.3438 14.9052 12.2308 15.0179 12.2308 15.1306C12.2308 15.2433 12.2308 15.356 12.3438 15.4686C12.4568 15.5813 12.5698 15.6376 12.7958 15.6376C12.9653 15.694 13.1348 15.6376 13.2478 15.6376C13.3608 15.5813 13.4737 15.4686 13.4737 15.356C13.4737 15.2433 13.4737 15.1306 13.3608 15.0179C13.2478 14.9616 13.0783 14.9052 12.9088 14.8489Z" fill="white" />
                    <path d="M11.1574 12.1973C8.83753 9.7712 8.83753 6.95078 10.2535 4.35219L8.32907 4.01416L6.17871 16.1444L15.9101 17.8381L16.5315 14.2254C16.6445 14.2254 13.4772 14.6198 11.1574 12.1937V12.1973ZM8.89403 15.1867L8.78104 14.905L7.9336 14.736L7.70762 14.9613L7.19916 14.8487L8.21608 13.8346L8.78104 13.9473L9.40249 15.2466L8.89403 15.1902V15.1867ZM11.6093 14.6797L10.9314 14.567L10.7619 15.5247L10.2535 15.412L10.4229 14.4543L9.74499 14.3416L9.80149 14.1163L11.6694 14.4543L11.6129 14.6797H11.6093ZM13.9292 15.4684C13.8727 15.6937 13.7597 15.8064 13.4772 15.8628C13.3077 15.9191 13.0253 15.9191 12.6863 15.8628C12.3473 15.8064 12.1213 15.6937 11.9518 15.5811C11.7259 15.412 11.6694 15.243 11.6694 15.0177C11.7259 14.7923 11.8389 14.6797 12.1213 14.6233C12.2908 14.567 12.5733 14.567 12.9123 14.6233C13.2512 14.6797 13.4772 14.7923 13.6467 14.905C13.8727 15.074 13.9857 15.243 13.9292 15.4684ZM15.8536 16.4261L14.2117 16.1444L14.4376 14.9578L14.9461 15.0705L14.7201 15.9719L15.8536 16.1973V16.4226V16.4261Z" fill="white" />
                    <path d="M10.0812 23.0882C3.96905 22.0143 -0.10216 16.2044 0.971254 10.1093C2.04467 4.01426 7.8743 -0.0456031 13.9864 1.02482C20.0985 2.09524 24.1733 7.90862 23.0963 14.0037C22.0229 20.0424 16.1933 24.1621 10.0812 23.0882ZM0.180317 9.94031C-0.953124 16.4297 3.40409 22.6938 9.91167 23.8206C16.4192 24.9509 22.7008 20.6058 23.8308 14.1164C23.9437 13.4403 24.0002 12.7044 24.0002 12.0283C24.0567 6.2713 19.982 1.25017 14.1559 0.179749C7.59182 -0.950533 1.36672 3.39454 0.180317 9.94031Z" fill="white" />
                    <path d="M3.00855 14.2289C3.00855 14.2852 3.06504 14.3979 3.12154 14.4542C3.23453 14.6796 3.46051 14.6796 3.68649 14.6232C3.96897 14.5669 4.13846 14.3415 4.08196 14.1725L4.02547 13.9472L3.00855 14.2289ZM1.70562 14.6232C1.70562 14.5105 1.64912 14.4542 1.64912 14.3415C1.64912 14.2289 1.59263 14.1725 1.53613 14.0598L3.96897 13.3838L4.25145 14.2852C4.36444 14.7922 4.25145 15.0739 3.85598 15.1866C3.23453 15.3556 2.95205 14.9613 2.78257 14.2852L1.70915 14.6232H1.70562ZM3.85598 16.4296C4.02547 16.7676 4.25145 16.8803 4.59042 16.6549C4.64692 16.6549 4.70341 16.5986 4.75991 16.5422C4.98589 16.3169 4.8164 16.0915 4.70341 15.9225L3.85598 16.4296ZM4.64692 15.3591L5.04239 16.0352C5.15538 16.2042 5.26837 16.4296 5.26837 16.5986C5.26837 16.8239 5.21187 16.9929 4.98589 17.162C4.64692 17.331 4.36444 17.2746 4.13846 16.9929C3.91248 17.331 3.74299 17.7253 3.5735 18.0634L3.46051 18.2887C3.40402 18.176 3.34752 18.0634 3.29102 18.007C3.23453 17.8944 3.17803 17.838 3.12154 17.7253L3.5735 16.9366C3.5735 16.8803 3.68649 16.6549 3.74299 16.5422L2.72607 17.1056C2.66957 17.0493 2.66957 16.9366 2.61308 16.8803C2.55658 16.8239 2.50009 16.7113 2.44359 16.6549L4.65045 15.3556L4.64692 15.3591ZM5.21187 18.5739C4.8729 18.912 4.70341 19.4753 5.15538 19.8169C5.60734 20.2113 6.1723 19.9296 6.5713 19.4789C6.91027 19.1408 7.07976 18.5775 6.68429 18.1796C6.23232 17.8979 5.78036 17.9542 5.21187 18.5739ZM4.98589 19.9859C4.36444 19.4789 4.25145 18.7429 4.8164 18.1232C5.32486 17.5598 6.11933 17.5035 6.79728 18.0669C7.58821 18.7429 7.30574 19.5352 6.96676 19.9296C6.4583 20.4929 5.66384 20.6056 4.98589 19.9859ZM8.09667 21.8486C8.04018 21.7922 7.92719 21.7359 7.87069 21.7359C7.8142 21.6796 7.70121 21.6796 7.58821 21.6232L8.49214 19.5352C8.26616 19.4225 8.04018 19.3662 7.8142 19.3098C7.8142 19.2535 7.87069 19.1972 7.87069 19.1972C7.87069 19.1408 7.92719 19.0845 7.92719 19.0282L9.68208 19.7606C9.68208 19.8169 9.62558 19.8732 9.62558 19.8732C9.62558 19.9296 9.56909 19.9859 9.56909 20.0422C9.3996 19.9296 9.17362 19.8169 9.00413 19.7606L8.10021 21.8486M11.437 20.0986C11.437 20.1549 11.3805 20.2113 11.3805 20.2676V20.4366C11.1545 20.3803 10.9285 20.3239 10.533 20.2676L10.4201 21.0563L10.8155 21.1127C10.985 21.1127 11.1545 21.169 11.2675 21.169C11.2675 21.2253 11.211 21.2817 11.211 21.338V21.507C11.098 21.4507 10.9285 21.4507 10.759 21.3944L10.3636 21.2253L10.2506 22.1831C10.646 22.2394 10.872 22.2394 11.098 22.2958C11.098 22.3521 11.0415 22.4084 11.0415 22.4648V22.6338L9.62558 22.4084L10.0211 19.926L11.437 20.0951M14.0958 22.0141L14.0393 22.3521C13.8133 22.4648 13.5873 22.5775 13.3049 22.5775C12.5139 22.6338 11.8889 22.2394 11.7759 21.4472C11.663 20.4894 12.2844 19.9789 13.0789 19.9225C13.3049 19.9225 13.6438 19.9225 13.8698 20.0352C13.8698 20.1479 13.8133 20.3169 13.8133 20.4296H13.7568C13.5873 20.2606 13.3614 20.1479 13.1354 20.1479C12.5139 20.2042 12.3444 20.8239 12.4009 21.3345C12.4574 21.9542 12.7964 22.3486 13.3614 22.2922C13.6438 22.3486 13.8698 22.1796 14.0958 22.0105M16.1897 21.7852C16.0767 21.7852 16.0202 21.8415 15.9072 21.8415C15.7942 21.8979 15.7377 21.8979 15.6812 21.9542L14.8338 19.8662C14.6078 19.9789 14.3818 20.0915 14.2123 20.1479C14.2123 20.0915 14.2123 20.0352 14.1558 19.9789C14.1558 19.9225 14.0993 19.8662 14.0993 19.8662L15.8542 19.1901C15.8542 19.2465 15.8542 19.3028 15.9107 19.3591C15.9107 19.4155 15.9672 19.4718 15.9672 19.4718C15.7412 19.5282 15.5152 19.5845 15.3458 19.6408L16.1932 21.7852M17.3266 18.1725C17.3266 18.2289 17.3831 18.2852 17.3831 18.2852L17.4961 18.3979C17.2701 18.5106 17.1006 18.6232 16.7617 18.8486L17.2136 19.4683L17.5526 19.2429C17.6656 19.1303 17.7786 19.0739 17.8916 18.9613C17.8916 19.0176 17.9481 19.0739 17.9481 19.0739L18.0611 19.1866C17.9481 19.2429 17.7786 19.2993 17.6656 19.412L17.3266 19.6373L17.8916 20.426C18.1741 20.2007 18.4 20.0317 18.5695 19.919C18.5695 19.9753 18.626 20.0317 18.626 20.0317L18.739 20.1444L17.6056 20.9331L16.1332 18.9014L17.3231 18.169M19.8689 18.8451L20.0384 18.6197C20.3774 18.2253 20.3774 17.7746 19.6994 17.2077C19.1345 16.757 18.739 16.8697 18.3965 17.2641L18.1705 17.5458L19.8689 18.8451ZM18.5095 16.8697C19.018 16.25 19.6429 16.3627 20.1514 16.757C20.8294 17.2641 20.8294 18.0563 20.3774 18.6197L19.7559 19.4084L17.7186 17.8838L18.5095 16.8697Z" fill="white" />
                  </g>
                  <defs>
                    <clipPath id="clip0_atol">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                <span className='font-light text-[16px] tracking-[0.04em]'>FLIGHT-INCLUSIVE PACKAGES ARE ATOL PROTECTED · T7655</span>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-32 mb-8">
              {/* Contact Section */}
              <div>
                <h3 className="text-[16px] font-medium tracking-[0.02em] tracking-wider mb-3 pb-2 border-b-2 border-[#df8abd] inline-block">
                  CONTACT
                </h3>
                <p className="text-[16px] font-light tracking-[0.04em] leading-relaxed mb-3 whitespace-nowrap">
                  PlanMyLuxe is a trading name <br/> of Plan My Tour Ltd.
                </p>
                <p className="text-[16px] font-light tracking-[0.04em] leading-relaxed mb-4">
                  314 Midsummer Boulevard,<br />
                  Milton Keynes, Beds MK9 2UB
                </p>
                
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <Link href="#" onClick={handleEnquireNow} className="text-[16px] font-weight-500 font-light tracking-[0.04em] underline text-white hover:text-[#df8abd] transition-colors">
                    Send an enquiry
                  </Link>
                  <PhoneNumber>
                    {({ phoneDisplay, phoneTel }) => (
                      <Link href={`tel:${phoneTel}`} className="flex items-center gap-2 text-white no-underline">
                        <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M22.0505 10.5542L22.0354 10.5573V8.89424C22.0354 4.27154 18.1138 0.509766 13.2936 0.509766H10.7878C5.96758 0.509766 2.04749 4.27004 2.04749 8.89424V10.5648C2.0098 10.5648 1.97211 10.5527 1.93291 10.5527C0.866943 10.5527 0 11.4423 0 12.5384V16.5897C0 17.6873 0.866943 18.5708 1.93291 18.5708C2.02639 18.5708 2.12137 18.5542 2.21184 18.5422C3.08481 21.1521 6.25405 23.1649 10.1862 23.5388C10.6054 24.0921 10.7863 24.4902 12.0694 24.4902C13.7158 24.4902 14.9536 23.8418 14.9536 23.0412C14.9536 22.2421 13.7158 21.5923 12.0694 21.5923C10.7968 21.5923 10.6204 21.9843 10.1937 22.5301C6.64305 22.1758 3.80701 20.4042 3.12853 18.1366C3.80249 18.1366 4.35884 17.2199 4.35884 16.5882V16.4042H4.36789V8.80679C4.36789 4.96661 6.65661 3.35183 10.7878 3.35183H13.2936C17.4142 3.35183 19.5401 4.91384 19.5401 8.82337V16.4223H19.5613V16.5882C19.5613 17.6858 20.6951 18.4291 21.7716 18.4291C22.8481 18.4291 24 17.6858 24 16.5882V12.5369C23.9985 11.4438 23.127 10.5542 22.0505 10.5542Z" fill="white" />
                        </svg>
                        <span className="font-bold text-lg">{phoneDisplay}</span>
                      </Link>
                    )}
                  </PhoneNumber>
                </div>

                <h4 className="text-[16px] font-medium tracking-[0.02em] tracking-wider mb-3 pb-2 border-b-2 border-[#df8abd] inline-block">
                  SOCIAL MEDIA
                </h4>
                <div className="flex gap-5">
                  {/* LinkedIn */}
                  {/* <Link href="#" target="_blank" aria-label="LinkedIn" className="hover:opacity-80 transition-opacity">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_linkedin)">
                        <path d="M29.6313 0H2.3625C1.05625 0 0 1.03125 0 2.30625V29.6875C0 30.9625 1.05625 32 2.3625 32H29.6313C30.9375 32 32 30.9625 32 29.6938V2.30625C32 1.03125 30.9375 0 29.6313 0ZM9.49375 27.2687H4.74375V11.9937H9.49375V27.2687ZM7.11875 9.9125C5.59375 9.9125 4.3625 8.68125 4.3625 7.1625C4.3625 5.64375 5.59375 4.4125 7.11875 4.4125C8.6375 4.4125 9.86875 5.64375 9.86875 7.1625C9.86875 8.675 8.6375 9.9125 7.11875 9.9125ZM27.2687 27.2687H22.525V19.8438C22.525 18.075 22.4937 15.7937 20.0562 15.7937C17.5875 15.7937 17.2125 17.725 17.2125 19.7188V27.2687H12.475V11.9937H17.025V14.0813H17.0875C17.7188 12.8813 19.2688 11.6125 21.575 11.6125C26.3813 11.6125 27.2687 14.775 27.2687 18.8875V27.2687Z" fill="white" />
                      </g>
                      <defs>
                        <clipPath id="clip0_linkedin">
                          <rect width="32" height="32" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </Link> */}
                  
                  {/* Facebook */}
                  <Link href="https://facebook.com/planmyluxe.co.uk" target="_blank" aria-label="Facebook" className="hover:opacity-80 transition-opacity">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 23.9859 5.85094 30.6053 13.5 31.8056V20.625H9.4375V16H13.5V12.475C13.5 8.465 15.8888 6.25 19.5434 6.25C21.2934 6.25 23.125 6.5625 23.125 6.5625V10.5H21.1075C19.12 10.5 18.5 11.7334 18.5 13V16H22.9375L22.2281 20.625H18.5V31.8056C26.1491 30.6053 32 23.9859 32 16Z" fill="white" />
                    </svg>
                  </Link>
                  
                  {/* X (Twitter) */}
                  {/* <Link href="#" target="_blank" aria-label="X" className="hover:opacity-80 transition-opacity">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M32 25.5025C32 29.0762 29.0762 32 25.5025 32H6.49746C2.92383 32 0 29.0762 0 25.5025V6.49746C0 2.9239 2.92383 0 6.49746 0H25.5025C29.0762 0 32 2.9239 32 6.49746V25.5025Z" fill="white" />
                      <path d="M18.3946 14.4043L26.092 4.81055H23.8624L17.2802 13.0151L10.6972 4.81055H3.34766L13.605 17.5952L5.90696 27.1897H8.13653L14.7195 18.9845L21.3031 27.1897H28.6527L18.3946 14.4043ZM6.972 6.54961H9.86244L25.0277 25.4505H22.1372L6.972 6.54961Z" fill="#595858" />
                    </svg>
                  </Link> */}
                  
                  {/* Instagram */}
                  <Link href="https://www.instagram.com/planmyluxe/" target="_blank" aria-label="Instagram" className="hover:opacity-80 transition-opacity">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_instagram)">
                        <path d="M16 2.88125C20.275 2.88125 20.7813 2.9 22.4625 2.975C24.025 3.04375 24.8688 3.30625 25.4313 3.525C26.175 3.8125 26.7125 4.1625 27.2688 4.71875C27.8313 5.28125 28.175 5.8125 28.4625 6.55625C28.6813 7.11875 28.9438 7.96875 29.0125 9.525C29.0875 11.2125 29.1063 11.7188 29.1063 15.9875C29.1063 20.2625 29.0875 20.7688 29.0125 22.45C28.9438 24.0125 28.6813 24.8563 28.4625 25.4188C28.175 26.1625 27.825 26.7 27.2688 27.2563C26.7063 27.8188 26.175 28.1625 25.4313 28.45C24.8688 28.6688 24.0188 28.9313 22.4625 29C20.775 29.075 20.2688 29.0938 16 29.0938C11.725 29.0938 11.2188 29.075 9.5375 29C7.975 28.9313 7.13125 28.6688 6.56875 28.45C5.825 28.1625 5.2875 27.8125 4.73125 27.2563C4.16875 26.6938 3.825 26.1625 3.5375 25.4188C3.31875 24.8563 3.05625 24.0063 2.9875 22.45C2.9125 20.7625 2.89375 20.2563 2.89375 15.9875C2.89375 11.7125 2.9125 11.2063 2.9875 9.525C3.05625 7.9625 3.31875 7.11875 3.5375 6.55625C3.825 5.8125 4.175 5.275 4.73125 4.71875C5.29375 4.15625 5.825 3.8125 6.56875 3.525C7.13125 3.30625 7.98125 3.04375 9.5375 2.975C11.2188 2.9 11.725 2.88125 16 2.88125ZM16 0C11.6563 0 11.1125 0.01875 9.40625 0.09375C7.70625 0.16875 6.5375 0.44375 5.525 0.8375C4.46875 1.25 3.575 1.79375 2.6875 2.6875C1.79375 3.575 1.25 4.46875 0.8375 5.51875C0.44375 6.5375 0.16875 7.7 0.09375 9.4C0.01875 11.1125 0 11.6562 0 16C0 20.3438 0.01875 20.8875 0.09375 22.5938C0.16875 24.2938 0.44375 25.4625 0.8375 26.475C1.25 27.5313 1.79375 28.425 2.6875 29.3125C3.575 30.2 4.46875 30.75 5.51875 31.1562C6.5375 31.55 7.7 31.825 9.4 31.9C11.1063 31.975 11.65 31.9937 15.9938 31.9937C20.3375 31.9937 20.8813 31.975 22.5875 31.9C24.2875 31.825 25.4563 31.55 26.4688 31.1562C27.5188 30.75 28.4125 30.2 29.3 29.3125C30.1875 28.425 30.7375 27.5313 31.1438 26.4813C31.5375 25.4625 31.8125 24.3 31.8875 22.6C31.9625 20.8938 31.9813 20.35 31.9813 16.0063C31.9813 11.6625 31.9625 11.1188 31.8875 9.4125C31.8125 7.7125 31.5375 6.54375 31.1438 5.53125C30.75 4.46875 30.2063 3.575 29.3125 2.6875C28.425 1.8 27.5313 1.25 26.4813 0.84375C25.4625 0.45 24.3 0.175 22.6 0.1C20.8875 0.01875 20.3438 0 16 0Z" fill="white" />
                        <path d="M16 7.78125C11.4625 7.78125 7.78125 11.4625 7.78125 16C7.78125 20.5375 11.4625 24.2188 16 24.2188C20.5375 24.2188 24.2188 20.5375 24.2188 16C24.2188 11.4625 20.5375 7.78125 16 7.78125ZM16 21.3312C13.0563 21.3312 10.6687 18.9438 10.6687 16C10.6687 13.0563 13.0563 10.6687 16 10.6687C18.9438 10.6687 21.3312 13.0563 21.3312 16C21.3312 18.9438 18.9438 21.3312 16 21.3312Z" fill="white" />
                        <path d="M26.4625 7.45635C26.4625 8.51885 25.6 9.3751 24.5438 9.3751C23.4813 9.3751 22.625 8.5126 22.625 7.45635C22.625 6.39385 23.4875 5.5376 24.5438 5.5376C25.6 5.5376 26.4625 6.4001 26.4625 7.45635Z" fill="white" />
                      </g>
                      <defs>
                        <clipPath id="clip0_instagram">
                          <rect width="32" height="32" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </Link>
                  
                  {/* Google */}
                  {/* <Link href="#" target="_blank" aria-label="Google" className="hover:opacity-80 transition-opacity">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_google)">
                        <path fillRule="evenodd" clipRule="evenodd" d="M22.4561 8.73058C20.8041 7.15498 18.5994 6.29663 16.3183 6.3319C12.1442 6.3319 8.5991 9.14797 7.33508 12.94V12.9401C6.66486 14.9272 6.66486 17.0789 7.33507 19.0661H7.34094C8.61083 22.8522 12.1501 25.6683 16.3242 25.6683C18.4789 25.6683 20.3287 25.1172 21.7624 24.1437V24.1398C23.4497 23.0228 24.602 21.2649 24.9607 19.2778H16.3184V13.1165H31.4101C31.5982 14.1865 31.6864 15.28 31.6864 16.3676C31.6864 21.2341 29.9472 25.3484 26.9211 28.1351L26.9243 28.1375C24.2728 30.5833 20.6336 32.0001 16.3183 32.0001C10.2687 32.0001 4.7365 28.5902 2.02035 23.1873V23.1873C-0.248975 18.6663 -0.248969 13.3398 2.02036 8.81881H2.0204L2.02035 8.81877C4.73649 3.40999 10.2687 0.000101659 16.3183 0.000101659C20.2926 -0.0469312 24.1317 1.44636 27.0242 4.16251L22.4561 8.73058Z" fill="white" />
                      </g>
                      <defs>
                        <clipPath id="clip0_google">
                          <rect width="32" height="32" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </Link> */}
                </div>
              </div>

              {/* Help & Support Section */}
              <div>
                <h3 className="text-[16px] font-semibold tracking-[0.02em] tracking-wider mb-3 pb-2 border-b-2 border-[#df8abd] inline-block">
                  HELP & SUPPORT
                </h3>
                <ul className="space-y-2 ">
                  <li>
                    <Link href="/" className="text-[16px] tracking-[0.04em] font-light leading-6 text-white hover:text-[#df8abd] transition-colors">
                      Latest Travel Advice
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact-us" className="text-[16px] tracking-[0.04em] font-light leading-6 text-white hover:text-[#df8abd] transition-colors">
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/faqs" className="text-[16px] tracking-[0.04em] font-light leading-6 text-white hover:text-[#df8abd] transition-colors">
                      Frequently Asked Questions
                    </Link>
                  </li>
                  <li>
                    <Link href="/" className="text-[16px] tracking-[0.04em] font-light leading-6 text-white hover:text-[#df8abd] transition-colors">
                      Feedback & Reviews
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://paperturn-view.com/?pid=ODg8871976&v=2.3&bgcolor=%23DCCFC7&embed=script&shadow=1&flipSound=1&hardCover=1"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[16px] tracking-[0.04em] font-light leading-6 text-white hover:text-[#df8abd] transition-colors"
                    >
                      Download our brochure
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Useful Links Section */}
              <div>
                <h3 className="text-[16px] font-medium tracking-[0.02em] tracking-wider mb-3 pb-2 border-b-2 border-[#df8abd] inline-block">
                  USEFUL LINKS
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/about-us" className="text-[16px] tracking-[0.04em] font-light leading-6 text-white hover:text-[#df8abd] transition-colors">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/about-us" className="text-[16px] tracking-[0.04em] font-light leading-6 text-white hover:text-[#df8abd] transition-colors">
                      Why Choose Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/payment-options" className="text-[16px] tracking-[0.04em] font-light leading-6 text-white hover:text-[#df8abd] transition-colors">
                      Payment Options
                    </Link>
                  </li>
                  
                  <li>
                    <Link href="/suppliers" className="text-[16px] tracking-[0.04em] font-light leading-6 text-white hover:text-[#df8abd] transition-colors">
                      Work for us
                    </Link>
                  </li>
                  <li>
                    <Link href="/sitemap.xml" className="text-[16px] tracking-[0.04em] font-light leading-6 text-white hover:text-[#df8abd] transition-colors">
                      Sitemap
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Newsletter Section */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex-shrink-0">
                  <h3 className="text-[16px] font-semibold tracking-[0.02em] mb-2 pb-2 border-b-2 border-[#df8abd] inline-block">
                    SIGNUP TO OUR NEWSLETTER
                  </h3>
                  <p className="text-[16px] font-light">Receive exclusive deals and discounts</p>
                </div>
                <form
                  className="flex flex-col sm:flex-row gap-3 flex-1 max-w-5xl"
                  onSubmit={handleNewsletterSubmit}
                >
                  <input
                    type="text"
                    name="full_name"
                    placeholder="FULL NAME"
                    aria-label="Full name"
                    required
                    className="flex-1 rounded-[8px] border-0 px-4 py-2 text-sm appearance-none bg-[#767676] text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-[#cb2187] md:py-3"
                    value={newsletterFullName}
                    onChange={(e) => setNewsletterFullName(e.target.value)}
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="EMAIL ADDRESS"
                    aria-label="Email address"
                    required
                    className="flex-1 rounded-[8px] border-0 px-4 py-2 text-sm appearance-none bg-[#767676] text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-[#cb2187] md:py-3"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="rounded-[8px] bg-[linear-gradient(110deg,_#cb2187_0%,_#cb2187_45%,_#ecaed3_100%)] px-8 py-2 text-[20px] font-semibold tracking-wider text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 md:py-3"
                    disabled={newsletterSubmitting}
                  >
                    {newsletterSubmitting ? 'PLEASE WAIT…' : 'SIGN UP'}
                  </button>
                </form>
              </div>
            </div>

            {/* Travel Aware Section */}
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="flex-shrink-0">
                <img
                  src="https://planmylux.s3.eu-west-2.amazonaws.com/uploads/media-library/homepage/travel-aware_footer.png"
                  alt="Travel Aware"
                  loading="lazy"
                  decoding="async"
                  className="w-[120px] h-auto"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-white text-[16px] font-light tracking-wide mb-3">
                  TRAVEL AWARE - PREPARING FOR SAFE AND HEALTHY TRAVEL ABROAD
                </h4>
                <p className="text-[16px] font-light mb-3">
                  The Foreign, Commonwealth & Development Office (FCDO) provide the latest travel advice by country including safety and security, entry requirements, travel warnings and health. For the latest FCDO advice please refer to{' '}
                  <a href="https://www.gov.uk/travelaware" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#cb2187] transition-colors">
                    www.gov.uk/travelaware
                  </a>
                </p>
                <p className="text-[16px] font-light">
                  Current travel health information can be found by visiting{' '}
                  <a href="https://www.travelhealthpro.org.uk" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#cb2187] transition-colors">
                    www.travelhealthpro.org.uk
                  </a>{' '}
                  a resource set up by Department of Health. The advice can change on all sites so please check regularly for updates.
                </p>
              </div>
            </div>

            {/* Footer Bottom */}
            <div className="pt-2 md:pt-4 flex flex-col md:flex-row justify-between items-center gap-4 text-[13px]">
              <span className='text-[14px] font-light'>© 2026 Plan My Tour Limited. All Rights Reserved.</span>
              <div className="flex items-center gap-2">
                <Link href="/" className="hover:text-[#cb2187] text-[12px] md:text-[14px] font-light transition-colors">
                  Cookie Policy
                </Link>
                <span>•</span>
                <Link href="/privacy-policy" className="hover:text-[#cb2187] text-[12px] md:text-[14px] font-light transition-colors">
                  Privacy Policy
                </Link>
                <span>•</span>
                <Link href="/terms-conditions" className="hover:text-[#cb2187] text-[12px] md:text-[14px] font-light transition-colors">
                  Terms & Conditions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer
