<?php

namespace App\Controller;

use App\Entity\Indisponibilite;
use App\Repository\ReservationRepository;
use App\Repository\IndisponibiliteRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class CoachDashboardController extends AbstractController
{
    #[Route('/coach/dashboard', name: 'coach_dashboard')]
    public function index(
        ReservationRepository $reservationRepo,
        IndisponibiliteRepository $indispoRepo
    ): Response {
        // Réservations
        $reservations = $reservationRepo->findAll();
        $reservationsData = [];

        foreach ($reservations as $res) {
            $start = $res->getDateDebut();
            $end   = $res->getDateFin();

            $reservationsData[] = [
                'date'  => $start?->format('Y-m-d'),
                'start' => $start?->format('H:i'),
                'end'   => $end?->format('H:i'),
                'client'=> $res->getPrenomClient().' '.$res->getNomClient(),
                'address' => [
                    'city' => $res->getVilleClient(),
                    'full' => $res->getAdresseCompleteClient(),
                ],
            ];
        }

        // Indisponibilités
        $indispos = $indispoRepo->findAll();
        $indispoData = [];

        foreach ($indispos as $i) {
            $indispoData[] = [
                'date' => $i->getDate()->format('Y-m-d'),
                'start' => $i->getStart(),
                'end' => $i->getEnd(),
                'reason' => $i->getReason(),
            ];
        }

        return $this->render('coach_dashboard/index.html.twig', [
            'reservations' => $reservationsData,
            'indisponibilites' => $indispoData,
        ]);
    }

    #[Route('/coach/indisponibilite/add', name: 'indisponibilite_add', methods: ['POST'])]
    public function addIndisponibilite(
        Request $request,
        EntityManagerInterface $em
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['date'], $data['start'], $data['end'], $data['reason'])) {
            return $this->json([
                'success' => false,
                'message' => 'Données manquantes'
            ]);
        }

        $indispo = new Indisponibilite();
        $indispo->setDate(new \DateTime($data['date']));
        $indispo->setStart($data['start']);
        $indispo->setEnd($data['end']);
        $indispo->setReason($data['reason']);

        $em->persist($indispo);
        $em->flush();

        return $this->json(['success' => true]);
    }
}
