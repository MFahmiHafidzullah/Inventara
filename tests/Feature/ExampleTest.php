<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_homepage_redirects_to_login(): void
    {
        $response = $this->get('/');

        $response->assertRedirect('/login');
    }

    public function test_login_redirects_to_frontend(): void
    {
        $response = $this->get('/login');

        $response->assertRedirect('http://localhost:5173/login');
    }
}
