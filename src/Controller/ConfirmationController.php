<?php

namespace App\Controller;
use Symfony\Component\HttpFoundation\Response;
use App\Entity\Reservation;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

final class ConfirmationController extends AbstractController
{
    #[Route('/confirmation', name: 'app_confirmation')]
    public function index(): Response
    {
        // Ici tu récupères les données côté front pour affichage
        // Exemple statique pour affichage (tu peux remplacer par session ou API)
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
                'lat' => null,
                'lng' => null,
            ],
            'discipline' => 'Yin Yoga',
            'sessionType' => 'Séance découverte',
            'date' => '2026-01-10',
            'time' => '14:00',
            'duration' => 60,
            'price' => 50,
            'options' => [],
            'total' => 50,
            'frequency' => 'unique',
        ];

        return $this->render('confirmation/index.html.twig', [
            'controller_name' => 'ConfirmationController',
            'booking' => $booking,
        ]);
    }

    // Endpoint pour enregistrer la réservation après paiement
    #[Route('/reservation/create', name: 'reservation_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['success' => false, 'message' => 'Données manquantes'], 400);
        }

        $sessionDuration = $data['duration'] ?? 60;
        $priceSession = $data['price'] ?? 0;
        $optionsPrice = 0;

        // Calcul total si options
        if (!empty($data['options']) && is_array($data['options'])) {
            $optionsPrice = array_sum(array_map(fn($o) => $o['price'] ?? 0, $data['options']));
        }

        $total = $data['total'] ?? ($priceSession + $optionsPrice);

        $reservation = new Reservation();
        $reservation->setNomClient($data['identity']['lastName']);
        $reservation->setPrenomClient($data['identity']['firstName']);
        $reservation->setEmailClient($data['identity']['email']);
        $reservation->setTelephoneClient($data['identity']['phone'] ?? null);
        $reservation->setAdresseClient($data['address']['street'] ?? '');
        $reservation->setComplementAdresse($data['address']['complement'] ?? '');
        $reservation->setVilleClient($data['address']['city'] ?? '');
        $reservation->setTypeLogement($data['address']['housingType'] ?? '');
        $reservation->setEtage($data['address']['floor'] ?? null);
        $reservation->setAscenseur($data['address']['hasElevator'] ?? 0);
        $reservation->setInfosAcces($data['address']['accessInfo'] ?? '');
        $reservation->setParking($data['address']['parking'] ?? '');
        $reservation->setLat($data['address']['lat'] ?? null);
        $reservation->setLng($data['address']['lng'] ?? null);
        $reservation->setDiscipline($data['discipline'] ?? '');
        $reservation->setSessionType($data['sessionType'] ?? '');
        $start = new \DateTime($data['date'] . 'T' . $data['time']);
        $reservation->setDateDebut($start);
        $end = (clone $start)->add(new \DateInterval('PT' . $sessionDuration . 'M'));
        $reservation->setDateFin($end);
        $reservation->setDureeMinutes($sessionDuration);
        $reservation->setFrequence($data['frequency'] ?? 'unique');
        $reservation->setOptions(json_encode($data['options'] ?? []));
        $reservation->setPrixSession($priceSession);
        $reservation->setPrixOptions($optionsPrice);
        $reservation->setTotal($total);
        $reservation->setStatus('paid'); // si paiement OK
        $reservation->setDateCreation(new \DateTime());

        $em->persist($reservation);
        $em->flush();

        return $this->json(['success' => true]);
    }
}
