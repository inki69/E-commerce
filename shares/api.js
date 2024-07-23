const base_url = "https://dummyjson.com";

export default async function handleRemoteRequest(endpoint,success,error,startLoading,stopLoading) {
    startLoading()
    try {
        const response = await fetch(`${base_url}/${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        success(data);
    } catch (err) {
        Swal.fire({
            title: 'Error!',
            text: `Something went wrong: ${err.message}`,
            icon: 'error',
            confirmButtonText: 'OK'
        });
        error(err); // Pass the error to the provided error callback
    }
    stopLoading()
}

