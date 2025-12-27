export default function JsonLd() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Baraka',
        image: 'https://www.barakasrl.it/logo.jpeg',
        '@id': 'https://www.barakasrl.it',
        url: 'https://www.barakasrl.it',
        telephone: '+393245668944',
        email: 'baraka.csg@gmail.com',
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Via Borgonovo 1',
            addressLocality: 'Castel San Giovanni',
            addressRegion: 'PC',
            postalCode: '29015',
            addressCountry: 'IT',
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: 45.0583,
            longitude: 9.4333,
        },
        openingHoursSpecification: [
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: [
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                    'Sunday',
                ],
                opens: '09:00',
                closes: '20:00',
            },
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
