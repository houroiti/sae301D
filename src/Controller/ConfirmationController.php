<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class ConfirmationController extends AbstractController
{
    #[Route('/confirmation', name: 'app_confirmation')]
    public function index(): Response
    {
        // Fake booking pour test (remplacer plus tard par la vraie réservation depuis la DB)
        $booking = [
            'identity' => [
                'civility' => 'Mme',
                'lastName' => 'Dupont',
                'firstName' => 'Lya',
                'birthDate' => new \DateTime('1990-05-10'),
                'email' => 'lya@example.com',
                'phone' => '0612345678',
            ],
            'address' => [
                'street' => '15 Rue de la Paix',
                'complement' => 'Appartement 3',
                'housingType' => 'Appartement',
                'floor' => 3,
                'hasElevator' => true,
                'accessInfo' => 'Digicode 1234',
                'parking' => 'Rue (gratuit)',
            ],
            'service' => 'Coaching Bien-être',
            'date' => new \DateTime('2026-01-10'),
            'time' => '14:00',
            'price' => 50,
            'tax' => 5,
            'total' => 55,
        ];

        return $this->render('confirmation/index.html.twig', [
            'controller_name' => 'ConfirmationController',
            'booking' => $booking, // <-- ici tu passes la variable booking à Twig
        ]);
    }
}

