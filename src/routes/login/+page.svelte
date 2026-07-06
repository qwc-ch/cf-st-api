<script>
    let username = '';
    let password = '';
    let error = '';

    async function handleLogin() {
        error = '';
        try {
            const res = await fetch('/api/admin-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            if (res.ok) {
                window.location.href = '/';
            } else {
                const data = await res.json();
                error = data.error || 'Login failed';
            }
        } catch {
            error = 'Network error';
        }
    }

    function handleKeydown(e) {
        if (e.key === 'Enter') handleLogin();
    }
</script>

<div class="login-container">
    <div class="login-box">
        <h1>SillyTavern</h1>
        <p>Please log in</p>
        <input
            type="text"
            bind:value={username}
            placeholder="Username"
            onkeydown={handleKeydown}
            autocomplete="username"
        />
        <input
            type="password"
            bind:value={password}
            placeholder="Password"
            onkeydown={handleKeydown}
            autocomplete="current-password"
        />
        {#if error}
            <div class="error">{error}</div>
        {/if}
        <button onclick={handleLogin}>Login</button>
    </div>
</div>

<style>
    .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: #1a1a2e;
        font-family: system-ui, sans-serif;
    }
    .login-box {
        background: #16213e;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
        width: 100%;
        max-width: 360px;
        text-align: center;
    }
    h1 {
        color: #e94560;
        margin: 0 0 0.5rem;
        font-size: 1.8rem;
    }
    p {
        color: #a0a0b0;
        margin: 0 0 1.5rem;
    }
    input {
        width: 100%;
        padding: 0.75rem;
        margin-bottom: 0.75rem;
        border: 1px solid #333;
        border-radius: 4px;
        background: #0f3460;
        color: #fff;
        font-size: 1rem;
        box-sizing: border-box;
    }
    input::placeholder {
        color: #666;
    }
    button {
        width: 100%;
        padding: 0.75rem;
        background: #e94560;
        color: #fff;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        font-weight: 600;
    }
    button:hover {
        background: #d63851;
    }
    .error {
        color: #ff6b6b;
        margin-bottom: 0.75rem;
        font-size: 0.9rem;
    }
</style>
