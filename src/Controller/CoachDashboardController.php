<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class CoachDashboardController extends AbstractController
{
    #[Route('/coach/dashboard', name: 'coach_dashboard')]
    public function index(): Response
    {
        return $this->render('coach_dashboard/index.html.twig');
    }
}
