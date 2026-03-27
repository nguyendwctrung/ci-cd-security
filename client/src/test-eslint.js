// Test file to check if ESLint is working
function testFunction() {
    console.log(undefinedVariable); // This should show an error
    const unusedVar = "test"; // This should show a warning
    
    return someUndefinedFunction(); // This should show an error
}

export default testFunction;    