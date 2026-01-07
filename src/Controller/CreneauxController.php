<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class CreneauxController extends AbstractController
{
    #[Route('/creneaux', name: 'app_creneaux')]
    public function index(): Response
    {
        return $this->render('creneaux/index.html.twig', [
            'controller_name' => 'CreneauxController',
        ]);
    }
}
