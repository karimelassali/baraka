async function testApi() {
    try {
        const response = await fetch('http://localhost:3000/api/admin/agent-knowledge');
        const text = await response.text();
        console.log('Status:', response.status);
        console.log('Body:', text);
    } catch (error) {
        console.error('Error:', error);
    }
}

testApi();
